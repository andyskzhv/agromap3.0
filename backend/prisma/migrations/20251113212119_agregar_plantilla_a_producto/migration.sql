-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "plantillaId" INTEGER;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
