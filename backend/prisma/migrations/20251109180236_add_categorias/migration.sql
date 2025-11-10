-- Crear tabla de categorías
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- Crear índice único para nombre
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- Agregar columna categoriaId a productos (nullable primero)
ALTER TABLE "productos" ADD COLUMN "categoriaId" INTEGER;

-- Agregar columna categoriaId a plantillas (nullable primero)
ALTER TABLE "plantillas_productos" ADD COLUMN "categoriaId" INTEGER;

-- Crear categorías a partir de las categorías existentes en productos
INSERT INTO "categorias" ("nombre", "descripcion", "activa", "creadoEn", "actualizadoEn")
SELECT DISTINCT 
    COALESCE("categoria", 'General') as "nombre",
    NULL as "descripcion",
    true as "activa",
    CURRENT_TIMESTAMP as "creadoEn",
    CURRENT_TIMESTAMP as "actualizadoEn"
FROM "productos"
WHERE "categoria" IS NOT NULL AND "categoria" != ''
ON CONFLICT ("nombre") DO NOTHING;

-- Crear categorías a partir de las categorías existentes en plantillas
INSERT INTO "categorias" ("nombre", "descripcion", "activa", "creadoEn", "actualizadoEn")
SELECT DISTINCT 
    COALESCE("categoria", 'General') as "nombre",
    NULL as "descripcion",
    true as "activa",
    CURRENT_TIMESTAMP as "creadoEn",
    CURRENT_TIMESTAMP as "actualizadoEn"
FROM "plantillas_productos"
WHERE "categoria" IS NOT NULL AND "categoria" != ''
ON CONFLICT ("nombre") DO NOTHING;

-- Si no hay categorías, crear una por defecto
INSERT INTO "categorias" ("nombre", "descripcion", "activa", "creadoEn", "actualizadoEn")
SELECT 'General', 'Categoría general', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "categorias");

-- Actualizar productos con categoriaId
UPDATE "productos" p
SET "categoriaId" = c.id
FROM "categorias" c
WHERE p."categoria" = c."nombre";

-- Para productos sin categoría o con categoría null, asignar "General"
UPDATE "productos"
SET "categoriaId" = (SELECT id FROM "categorias" WHERE "nombre" = 'General' LIMIT 1)
WHERE "categoriaId" IS NULL;

-- Actualizar plantillas con categoriaId
UPDATE "plantillas_productos" p
SET "categoriaId" = c.id
FROM "categorias" c
WHERE p."categoria" = c."nombre";

-- Para plantillas sin categoría o con categoría null, asignar "General"
UPDATE "plantillas_productos"
SET "categoriaId" = (SELECT id FROM "categorias" WHERE "nombre" = 'General' LIMIT 1)
WHERE "categoriaId" IS NULL;

-- Hacer categoriaId NOT NULL
ALTER TABLE "productos" ALTER COLUMN "categoriaId" SET NOT NULL;
ALTER TABLE "plantillas_productos" ALTER COLUMN "categoriaId" SET NOT NULL;

-- Agregar foreign keys
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "plantillas_productos" ADD CONSTRAINT "plantillas_productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Eliminar columnas antiguas de categoria (string)
ALTER TABLE "productos" DROP COLUMN "categoria";
ALTER TABLE "plantillas_productos" DROP COLUMN "categoria";

