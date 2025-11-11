/*
  Warnings:

  - The `cantidad` column on the `productos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `correo` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId,productoId]` on the table `comentarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombreUsuario]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombreUsuario` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('UNIDAD', 'KG', 'LB', 'SACO', 'LIBRA', 'QUINTAL', 'TONELADA');

-- DropIndex
DROP INDEX "usuarios_correo_key";

-- AlterTable
ALTER TABLE "categorias" ALTER COLUMN "actualizadoEn" DROP DEFAULT;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'CUP',
ADD COLUMN     "unidadMedida" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
ADD COLUMN     "unidadPrecio" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
DROP COLUMN "cantidad",
ADD COLUMN     "cantidad" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "correo",
ADD COLUMN     "nombreUsuario" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "valoraciones" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valoraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_like_comentario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "comentarioId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_like_comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "valoraciones_usuarioId_productoId_key" ON "valoraciones"("usuarioId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_like_comentario_usuarioId_comentarioId_key" ON "usuario_like_comentario"("usuarioId", "comentarioId");

-- CreateIndex
CREATE UNIQUE INDEX "comentarios_usuarioId_productoId_key" ON "comentarios"("usuarioId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombreUsuario_key" ON "usuarios"("nombreUsuario");

-- AddForeignKey
ALTER TABLE "valoraciones" ADD CONSTRAINT "valoraciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valoraciones" ADD CONSTRAINT "valoraciones_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_like_comentario" ADD CONSTRAINT "usuario_like_comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_like_comentario" ADD CONSTRAINT "usuario_like_comentario_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "comentarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
