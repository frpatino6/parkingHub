import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import 'dotenv/config';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'UmbracoDb',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableArithAbort: true
  }
};

let pool = null;

async function getPool() {
  try {
    console.error(`DEBUG: Connecting to ${config.server}:${config.port}, DB: ${config.database}, User: ${config.user}`);
    if (pool) {
      console.error('DEBUG: Closing existing pool');
      try { await pool.close(); } catch (e) {
        console.error('DEBUG: Error closing pool:', e.message);
      }
    }
    pool = await sql.connect(config);
    console.error('DEBUG: Pool connected. State:', pool.connected);
    return pool;
  } catch (err) {
    console.error('DEBUG: Error in getPool:', err.message);
    pool = null;
    throw err;
  }
}

const server = new Server(
  {
    name: 'umbraco-translations-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'check_translation',
      description: 'Verifica si una clave de traducción existe en Umbraco para un idioma específico',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'La clave de traducción a buscar (ej: "Search.Search_From")'
          },
          languageCode: {
            type: 'string',
            description: 'Código ISO del idioma (ej: "en-GB", "es-ES")',
            default: 'en-GB'
          }
        },
        required: ['key']
      }
    },
    {
      name: 'get_languages',
      description: 'Obtiene la lista de idiomas disponibles en Umbraco',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'search_translations',
      description: 'Busca traducciones que coincidan con un patrón',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Patrón de búsqueda (usa % como comodín)'
          },
          languageCode: {
            type: 'string',
            description: 'Código ISO del idioma',
            default: 'en-GB'
          }
        },
        required: ['pattern']
      }
    },
    {
      name: 'bulk_check_translations',
      description: 'Verifica múltiples traducciones de un archivo y genera un reporte',
      inputSchema: {
        type: 'object',
        properties: {
          keysFile: {
            type: 'string',
            description: 'Ruta al archivo con las claves a verificar (una por línea)'
          },
          languageCode: {
            type: 'string',
            description: 'Código ISO del idioma',
            default: 'en-GB'
          },
          outputFormat: {
            type: 'string',
            enum: ['json', 'csv', 'text'],
            description: 'Formato del reporte de salida',
            default: 'json'
          }
        },
        required: ['keysFile']
      }
    },
    {
      name: 'create_translation',
      description: 'Crea una nueva clave de traducción con sus textos en los 3 idiomas',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'La clave de traducción a crear (ej: "Search.NewKey")'
          },
          translations: {
            type: 'object',
            description: 'Objeto con las traducciones por idioma',
            properties: {
              'en-GB': { type: 'string', description: 'Texto en inglés' },
              'de-DE': { type: 'string', description: 'Texto en alemán' },
              'tr-TR': { type: 'string', description: 'Texto en turco' }
            }
          }
        },
        required: ['key', 'translations']
      }
    },
    {
      name: 'delete_translation',
      description: 'Elimina una clave de traducción y todos sus textos en todos los idiomas',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'La clave de traducción a eliminar (ej: "Search.OldKey")'
          }
        },
        required: ['key']
      }
    },
    {
      name: 'update_translation',
      description: 'Actualiza los textos de una clave de traducción existente',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'La clave de traducción a actualizar'
          },
          translations: {
            type: 'object',
            description: 'Objeto con las nuevas traducciones por idioma',
            properties: {
              'en-GB': { type: 'string', description: 'Texto en inglés' },
              'de-DE': { type: 'string', description: 'Texto en alemán' },
              'tr-TR': { type: 'string', description: 'Texto en turco' }
            }
          }
        },
        required: ['key', 'translations']
      }
    },
    {
      name: 'check_translation_in_db',
      description: 'Verifica si una clave de traducción existe en una base de datos específica',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'La clave de traducción a buscar'
          },
          database: {
            type: 'string',
            description: 'Nombre de la base de datos (ej: "xq_ibe_test4")'
          },
          languageCode: {
            type: 'string',
            description: 'Código ISO del idioma',
            default: 'en-GB'
          }
        },
        required: ['key', 'database']
      }
    },
    {
      name: 'get_banners',
      description: 'Obtiene la lista de banners disponibles en Umbraco',
      inputSchema: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            description: 'Tipo de contenido de banner (ej: "bannerGenericContent", "bannerLegacyContent")',
            default: null
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados a retornar',
            default: 50
          }
        }
      }
    },
    {
      name: 'search_content',
      description: 'Busca contenido en Umbraco por nombre o tipo de documento',
      inputSchema: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            description: 'Tipo de contenido (document type alias)'
          },
          namePattern: {
            type: 'string',
            description: 'Patrón de búsqueda para el nombre del contenido (usa % como comodín)'
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados',
            default: 50
          }
        }
      }
    },
    {
      name: 'get_content_types',
      description: 'Obtiene la lista de tipos de contenido (document types) disponibles en Umbraco',
      inputSchema: {
        type: 'object',
        properties: {
          aliasPattern: {
            type: 'string',
            description: 'Patrón de búsqueda para el alias del tipo de contenido (usa % como comodín)',
            default: null
          }
        }
      }
    },
    {
      name: 'check_table_exists',
      description: 'Verifica si una tabla existe en la base de datos',
      inputSchema: {
        type: 'object',
        properties: {
          tableName: {
            type: 'string',
            description: 'Nombre de la tabla a verificar'
          }
        },
        required: ['tableName']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const dbPool = await getPool();

    switch (name) {
      case 'check_translation': {
        const { key, languageCode = 'en-GB' } = args;

        const result = await dbPool.request()
          .input('key', sql.NVarChar, key)
          .input('languageCode', sql.NVarChar, languageCode)
          .query(`
            SELECT 
              di.[key] as DictionaryKey,
              lt.value as Translation,
              l.languageISOCode as LanguageCode
            FROM cmsDictionary di
            LEFT JOIN cmsLanguageText lt ON di.id = lt.uniqueId
            LEFT JOIN umbracoLanguage l ON lt.languageId = l.id
            WHERE di.[key] = @key 
              AND (l.languageISOCode = @languageCode OR l.languageISOCode IS NULL)
          `);

        const exists = result.recordset.length > 0;
        const hasTranslation = exists && result.recordset[0].Translation !== null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                key,
                exists,
                hasTranslation,
                translation: hasTranslation ? result.recordset[0].Translation : null,
                languageCode,
                status: !exists ? 'NOT_FOUND' : !hasTranslation ? 'NO_TRANSLATION' : 'OK'
              }, null, 2)
            }
          ]
        };
      }

      case 'get_languages': {
        const result = await dbPool.request().query(`
          SELECT 
            id,
            languageISOCode,
            languageCultureName,
            isDefaultVariantLang
          FROM umbracoLanguage
          ORDER BY isDefaultVariantLang DESC, languageISOCode
        `);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                languages: result.recordset,
                count: result.recordset.length
              }, null, 2)
            }
          ]
        };
      }

      case 'search_translations': {
        const { pattern, languageCode = 'en-GB' } = args;

        const result = await dbPool.request()
          .input('pattern', sql.NVarChar, pattern)
          .input('languageCode', sql.NVarChar, languageCode)
          .query(`
            SELECT TOP 50
              di.[key] as DictionaryKey,
              lt.value as Translation,
              l.languageISOCode as LanguageCode
            FROM cmsDictionary di
            LEFT JOIN cmsLanguageText lt ON di.id = lt.uniqueId
            LEFT JOIN umbracoLanguage l ON lt.languageId = l.id
            WHERE di.[key] LIKE @pattern 
              AND (l.languageISOCode = @languageCode OR l.languageISOCode IS NULL)
            ORDER BY di.[key]
          `);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                results: result.recordset,
                count: result.recordset.length
              }, null, 2)
            }
          ]
        };
      }

      case 'bulk_check_translations': {
        const { keysFile, languageCode = 'en-GB', outputFormat = 'json' } = args;

        const keysPath = join(__dirname, keysFile);
        const keysContent = await fs.readFile(keysPath, 'utf-8');
        const keys = keysContent.split('\n')
          .map(k => k.trim())
          .filter(k => k && !k.startsWith('#'));

        const results = [];
        const missing = [];
        const noTranslation = [];

        for (const key of keys) {
          const result = await dbPool.request()
            .input('key', sql.NVarChar, key)
            .input('languageCode', sql.NVarChar, languageCode)
            .query(`
              SELECT 
                di.[key] as DictionaryKey,
                lt.value as Translation,
                l.languageISOCode as LanguageCode
              FROM cmsDictionary di
              LEFT JOIN cmsLanguageText lt ON di.id = lt.uniqueId
              LEFT JOIN umbracoLanguage l ON lt.languageId = l.id
              WHERE di.[key] = @key 
                AND (l.languageISOCode = @languageCode OR l.languageISOCode IS NULL)
            `);

          const exists = result.recordset.length > 0;
          const hasTranslation = exists && result.recordset[0].Translation !== null;

          const status = !exists ? 'NOT_FOUND' : !hasTranslation ? 'NO_TRANSLATION' : 'OK';

          results.push({
            key,
            exists,
            hasTranslation,
            translation: hasTranslation ? result.recordset[0].Translation : null,
            status
          });

          if (!exists) missing.push(key);
          if (exists && !hasTranslation) noTranslation.push(key);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = join(__dirname, `report_${languageCode}_${timestamp}.${outputFormat}`);

        let reportContent;
        if (outputFormat === 'json') {
          reportContent = JSON.stringify({
            languageCode,
            totalKeys: keys.length,
            found: results.filter(r => r.status === 'OK').length,
            missing: missing.length,
            noTranslation: noTranslation.length,
            missingKeys: missing,
            noTranslationKeys: noTranslation,
            details: results
          }, null, 2);
        } else if (outputFormat === 'csv') {
          reportContent = 'Key,Status,Has Translation,Translation\n';
          results.forEach(r => {
            reportContent += `"${r.key}","${r.status}",${r.hasTranslation},"${r.translation || ''}"\n`;
          });
        } else {
          reportContent = `REPORTE DE TRADUCCIONES - ${languageCode}\n`;
          reportContent += `=================================================\n\n`;
          reportContent += `Total de claves: ${keys.length}\n`;
          reportContent += `Encontradas: ${results.filter(r => r.status === 'OK').length}\n`;
          reportContent += `Faltantes: ${missing.length}\n`;
          reportContent += `Sin traducción: ${noTranslation.length}\n\n`;
          
          if (missing.length > 0) {
            reportContent += `\nCLAVES FALTANTES:\n`;
            reportContent += `------------------\n`;
            missing.forEach(k => reportContent += `- ${k}\n`);
          }

          if (noTranslation.length > 0) {
            reportContent += `\nCLAVES SIN TRADUCCIÓN:\n`;
            reportContent += `----------------------\n`;
            noTranslation.forEach(k => reportContent += `- ${k}\n`);
          }
        }

        await fs.writeFile(reportPath, reportContent, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                languageCode,
                totalKeys: keys.length,
                found: results.filter(r => r.status === 'OK').length,
                missing: missing.length,
                noTranslation: noTranslation.length,
                reportPath,
                summary: {
                  missingKeys: missing,
                  noTranslationKeys: noTranslation
                }
              }, null, 2)
            }
          ]
        };
      }

      case 'create_translation': {
        const { key, translations } = args;

        try {
          const keyParts = key.split('.');
          const parentKey = keyParts[0];
          
          let parentId = null;
          if (parentKey) {
            const parentResult = await dbPool.request()
              .input('parentKey', sql.NVarChar, parentKey)
              .query(`SELECT id FROM cmsDictionary WHERE [key] = @parentKey`);
            
            if (parentResult.recordset.length > 0) {
              parentId = parentResult.recordset[0].id;
            }
          }
          
          const newId = await dbPool.request()
            .input('key', sql.NVarChar, key)
            .input('parentId', sql.UniqueIdentifier, parentId)
            .query(`
              DECLARE @newId UNIQUEIDENTIFIER = NEWID();
              INSERT INTO cmsDictionary ([key], id, parent)
              VALUES (@key, @newId, @parentId);
              SELECT @newId as id;
            `);

          if (newId.recordset.length === 0) {
            throw new Error('Failed to create dictionary entry');
          }

          const dictId = newId.recordset[0].id;

          const languages = await dbPool.request().query(`
            SELECT id, languageISOCode FROM umbracoLanguage
            WHERE languageISOCode IN ('en-GB', 'de-DE', 'tr-TR')
          `);

          const results = [];
          for (const lang of languages.recordset) {
            const translation = translations[lang.languageISOCode];
            if (translation) {
              await dbPool.request()
                .input('uniqueId', sql.UniqueIdentifier, dictId)
                .input('languageId', sql.Int, lang.id)
                .input('value', sql.NVarChar, translation)
                .query(`
                  INSERT INTO cmsLanguageText (UniqueId, languageId, value)
                  VALUES (@uniqueId, @languageId, @value)
                `);
              
              results.push({
                language: lang.languageISOCode,
                text: translation,
                status: 'created'
              });
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  key,
                  dictionaryId: dictId,
                  translations: results
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          throw error;
        }
      }

      case 'delete_translation': {
        const { key } = args;

        try {
          const dict = await dbPool.request()
            .input('key', sql.NVarChar, key)
            .query('SELECT id FROM cmsDictionary WHERE [key] = @key');

          if (dict.recordset.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    key,
                    message: 'Translation key not found'
                  }, null, 2)
                }
              ]
            };
          }

          const dictId = dict.recordset[0].id;

          const deletedTranslations = await dbPool.request()
            .input('uniqueId', sql.UniqueIdentifier, dictId)
            .query('DELETE FROM cmsLanguageText WHERE UniqueId = @uniqueId; SELECT @@ROWCOUNT as deleted');

          await dbPool.request()
            .input('key', sql.NVarChar, key)
            .query('DELETE FROM cmsDictionary WHERE [key] = @key');

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  key,
                  dictionaryId: dictId,
                  deletedTranslations: deletedTranslations.recordset[0].deleted,
                  message: 'Translation deleted successfully'
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          throw error;
        }
      }

      case 'update_translation': {
        const { key, translations } = args;

        try {
          const dictResult = await dbPool.request()
            .input('key', sql.NVarChar, key)
            .query('SELECT id FROM cmsDictionary WHERE [key] = @key');

          if (dictResult.recordset.length === 0) {
            throw new Error(`La clave '${key}' no existe en el diccionario.`);
          }

          const dictId = dictResult.recordset[0].id;
          const languages = await dbPool.request().query(`
            SELECT id, languageISOCode FROM umbracoLanguage
            WHERE languageISOCode IN ('en-GB', 'de-DE', 'tr-TR')
          `);

          const results = [];
          for (const lang of languages.recordset) {
            const translation = translations[lang.languageISOCode];
            if (translation !== undefined) {
              // Upsert logic: attempt delete then insert
              await dbPool.request()
                .input('uniqueId', sql.UniqueIdentifier, dictId)
                .input('languageId', sql.Int, lang.id)
                .query('DELETE FROM cmsLanguageText WHERE uniqueId = @uniqueId AND languageId = @languageId');

              await dbPool.request()
                .input('uniqueId', sql.UniqueIdentifier, dictId)
                .input('languageId', sql.Int, lang.id)
                .input('value', sql.NVarChar, translation)
                .query(`
                  INSERT INTO cmsLanguageText (UniqueId, languageId, value)
                  VALUES (@uniqueId, @languageId, @value)
                `);

              results.push({
                language: lang.languageISOCode,
                text: translation,
                status: 'updated'
              });
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  key,
                  dictionaryId: dictId,
                  updates: results
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          throw error;
        }
      }

      case 'check_translation_in_db': {
        const { key, database, languageCode = 'en-GB' } = args;

        const dbConfig = {
          user: process.env.DB_USER || 'sa',
          password: process.env.DB_PASSWORD,
          database: database,
          server: process.env.DB_SERVER || 'localhost',
          port: parseInt(process.env.DB_PORT || '1433'),
          options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
            enableArithAbort: true
          }
        };

        const tempPool = await sql.connect(dbConfig);

        try {
          const result = await tempPool.request()
            .input('key', sql.NVarChar, key)
            .input('languageCode', sql.NVarChar, languageCode)
            .query(`
              SELECT 
                di.[key] as DictionaryKey,
                lt.value as Translation,
                l.languageISOCode as LanguageCode
              FROM cmsDictionary di
              LEFT JOIN cmsLanguageText lt ON di.id = lt.uniqueId
              LEFT JOIN umbracoLanguage l ON lt.languageId = l.id
              WHERE di.[key] = @key 
                AND (l.languageISOCode = @languageCode OR l.languageISOCode IS NULL)
            `);

          const exists = result.recordset.length > 0;
          const hasTranslation = exists && result.recordset[0].Translation !== null;

          await tempPool.close();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  key,
                  exists,
                  hasTranslation,
                  translation: hasTranslation ? result.recordset[0].Translation : null,
                  languageCode,
                  database,
                  status: !exists ? 'NOT_FOUND' : !hasTranslation ? 'NO_TRANSLATION' : 'OK'
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          await tempPool.close();
          throw error;
        }
      }

      case 'get_banners': {
        const { contentType = null, limit = 50 } = args;
        const limitValue = Math.min(limit, 1000);

        try {
          const request = dbPool.request();
          // GUID para Content (documentos) en Umbraco
          const contentNodeTypeGuid = 'C66BA18E-EAF3-4CFF-8A22-41B16D66A972';
          
          let query;
          if (contentType) {
            query = `
              SELECT TOP ${limitValue}
                n.id,
                n.uniqueId,
                n.text as Name,
                n.nodeObjectType,
                ct.alias as ContentTypeAlias,
                n.createDate,
                n.trashed
              FROM umbracoNode n
              INNER JOIN umbracoContent c ON n.id = c.nodeId
              INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
              WHERE n.nodeObjectType = CAST('C66BA18E-EAF3-4CFF-8A22-41B16D66A972' AS UNIQUEIDENTIFIER)
                AND n.trashed = 0
                AND ct.alias = @contentType
                AND EXISTS (SELECT 1 FROM umbracoContent c2 WHERE c2.nodeId = n.id)
              ORDER BY n.createDate DESC
            `;
            request.input('contentType', sql.NVarChar, contentType);
          } else {
            query = `
              SELECT TOP ${limitValue}
                n.id,
                n.uniqueId,
                n.text as Name,
                n.nodeObjectType,
                n.createDate,
                n.trashed
              FROM umbracoNode n
              WHERE n.nodeObjectType = CAST('C66BA18E-EAF3-4CFF-8A22-41B16D66A972' AS UNIQUEIDENTIFIER)
                AND n.trashed = 0
                AND EXISTS (SELECT 1 FROM umbracoContent c WHERE c.nodeId = n.id)
              ORDER BY n.createDate DESC
            `;
          }

          const result = await request.query(query);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  banners: result.recordset,
                  count: result.recordset.length
                }, null, 2)
              }
            ]
          };
        } catch (dbError) {
          let errorMsg = 'Error desconocido';
          let errorNumber = 'N/A';
          let errorInfo = {};
          
          // Intentar obtener el error real de SQL Server
          if (dbError.originalError) {
            errorMsg = dbError.originalError.message || dbError.message || String(dbError);
            errorNumber = dbError.originalError.number || dbError.number || 'N/A';
            errorInfo = {
              info: dbError.originalError.info || {},
              code: dbError.originalError.code || dbError.code || 'N/A',
              class: dbError.originalError.class || 'N/A',
              state: dbError.originalError.state || 'N/A'
            };
          } else {
            errorMsg = dbError.message || String(dbError);
            errorNumber = dbError.number || 'N/A';
            errorInfo = {
              code: dbError.code || 'N/A'
            };
          }
          
          throw new Error(`Error SQL get_banners [${errorNumber}]: ${errorMsg}. Info: ${JSON.stringify(errorInfo)}`);
        }
      }

      case 'search_content': {
        const { contentType, namePattern, limit = 50 } = args;

        if (!contentType && !namePattern) {
          throw new Error('Debe proporcionar contentType o namePattern');
        }

        const limitValue = Math.min(limit, 1000);

        try {
          let query = `
            SELECT TOP (${limitValue})
              n.id,
              n.uniqueId,
              n.text as Name,
              n.nodeObjectType,
              ct.alias as ContentTypeAlias,
              n.createDate,
              n.trashed
            FROM umbracoNode n
            INNER JOIN umbracoContent c ON n.id = c.nodeId
            INNER JOIN cmsContentType ct ON c.contentTypeId = ct.nodeId
            WHERE n.nodeObjectType = CAST('C66BA18E-EAF3-4CFF-8A22-41B16D66A972' AS UNIQUEIDENTIFIER)
              AND n.trashed = 0
              AND EXISTS (SELECT 1 FROM umbracoContent c2 WHERE c2.nodeId = n.id)
          `;

          const request = dbPool.request();
          
          if (contentType) {
            query += ` AND ct.alias = @contentType`;
            request.input('contentType', sql.NVarChar, contentType);
          }
          if (namePattern) {
            query += ` AND n.text LIKE @namePattern`;
            request.input('namePattern', sql.NVarChar, namePattern);
          }

          query += ` ORDER BY n.createDate DESC`;

          const result = await request.query(query);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  content: result.recordset,
                  count: result.recordset.length
                }, null, 2)
              }
            ]
          };
        } catch (dbError) {
          const sqlError = dbError.originalError || dbError;
          const errorMsg = sqlError.message || dbError.message || 'Error desconocido';
          const errorNumber = sqlError.number || dbError.number;
          throw new Error(`Error SQL [${errorNumber}]: ${errorMsg}`);
        }
      }

      case 'get_content_types': {
        const { aliasPattern = null } = args;

        try {
          let query = `
            SELECT 
              ct.nodeId,
              ct.alias,
              ct.icon,
              ct.thumbnail,
              ct.description
            FROM cmsContentType ct
            WHERE ct.nodeId IN (
              SELECT DISTINCT contentTypeId 
              FROM umbracoContent
            )
          `;

          const request = dbPool.request();
          if (aliasPattern) {
            query += ` AND ct.alias LIKE @aliasPattern`;
            request.input('aliasPattern', sql.NVarChar, aliasPattern);
          }

          query += ` ORDER BY ct.alias`;

          const result = await request.query(query);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  contentTypes: result.recordset,
                  count: result.recordset.length
                }, null, 2)
              }
            ]
          };
        } catch (dbError) {
          const sqlError = dbError.originalError || dbError;
          const errorMsg = sqlError.message || dbError.message || sqlError.toString() || 'Error desconocido';
          const errorNumber = sqlError.number || dbError.number || 'N/A';
          throw new Error(`Error SQL get_content_types [${errorNumber}]: ${errorMsg}`);
        }
      }

      case 'check_table_exists': {
        const { tableName } = args;

        try {
          const result = await dbPool.request()
            .input('tableName', sql.NVarChar, tableName)
            .query(`
              SELECT TABLE_NAME 
              FROM INFORMATION_SCHEMA.TABLES 
              WHERE TABLE_NAME = @tableName
            `);

          const exists = result.recordset.length > 0;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  tableName,
                  exists,
                  message: exists ? `La tabla ${tableName} existe` : `La tabla ${tableName} no existe`
                }, null, 2)
              }
            ]
          };
        } catch (dbError) {
          const sqlError = dbError.originalError || dbError;
          const errorMsg = sqlError.message || dbError.message || sqlError.toString() || 'Error desconocido';
          const errorNumber = sqlError.number || dbError.number || 'N/A';
          throw new Error(`Error SQL check_table_exists [${errorNumber}]: ${errorMsg}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message || error.toString(),
            stack: error.stack,
            info: error.info || error.code || 'No additional info'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Umbraco Translations MCP Server running on stdio');
}

runServer().catch(console.error);
