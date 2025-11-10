const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrarCategorias() {
  try {
    console.log('🔄 Iniciando migración de categorías...');

    // 1. Obtener todas las categorías únicas de productos existentes
    const productos = await prisma.$queryRaw`
      SELECT DISTINCT categoria 
      FROM productos 
      WHERE categoria IS NOT NULL AND categoria != ''
    `;

    // 2. Obtener todas las categorías únicas de plantillas existentes
    const plantillas = await prisma.$queryRaw`
      SELECT DISTINCT categoria 
      FROM plantillas_productos 
      WHERE categoria IS NOT NULL AND categoria != ''
    `;

    // 3. Combinar y obtener categorías únicas
    const categoriasUnicas = new Set();
    productos.forEach(p => categoriasUnicas.add(p.categoria));
    plantillas.forEach(p => categoriasUnicas.add(p.categoria));

    console.log(`📋 Encontradas ${categoriasUnicas.size} categorías únicas`);

    // 4. Crear categorías en la nueva tabla
    const categoriasCreadas = {};
    for (const nombreCategoria of categoriasUnicas) {
      if (nombreCategoria) {
        try {
          const categoria = await prisma.categoria.create({
            data: {
              nombre: nombreCategoria.trim(),
              descripcion: null,
              activa: true
            }
          });
          categoriasCreadas[nombreCategoria] = categoria.id;
          console.log(`✅ Categoría creada: ${nombreCategoria} (ID: ${categoria.id})`);
        } catch (error) {
          if (error.code === 'P2002') {
            // Ya existe, obtenerla
            const existente = await prisma.categoria.findUnique({
              where: { nombre: nombreCategoria.trim() }
            });
            if (existente) {
              categoriasCreadas[nombreCategoria] = existente.id;
              console.log(`ℹ️  Categoría ya existe: ${nombreCategoria} (ID: ${existente.id})`);
            }
          } else {
            console.error(`❌ Error al crear categoría ${nombreCategoria}:`, error.message);
          }
        }
      }
    }

    // 5. Si no hay categorías, crear una por defecto
    if (categoriasUnicas.size === 0) {
      const categoriaDefault = await prisma.categoria.create({
        data: {
          nombre: 'General',
          descripcion: 'Categoría general',
          activa: true
        }
      });
      categoriasCreadas['General'] = categoriaDefault.id;
      console.log(`✅ Categoría por defecto creada: General (ID: ${categoriaDefault.id})`);
    }

    // 6. Obtener la primera categoría disponible como fallback
    const primeraCategoria = await prisma.categoria.findFirst({
      orderBy: { id: 'asc' }
    });

    if (!primeraCategoria) {
      throw new Error('No se pudo crear ninguna categoría');
    }

    console.log(`\n📝 Actualizando productos...`);
    
    // 7. Actualizar productos
    const todosProductos = await prisma.$queryRaw`
      SELECT id, categoria FROM productos
    `;

    for (const producto of todosProductos) {
      const categoriaId = categoriasCreadas[producto.categoria] || primeraCategoria.id;
      await prisma.$executeRaw`
        UPDATE productos 
        SET "categoriaId" = ${categoriaId}
        WHERE id = ${producto.id}
      `;
      console.log(`  ✓ Producto ${producto.id} actualizado`);
    }

    console.log(`\n📝 Actualizando plantillas...`);
    
    // 8. Actualizar plantillas
    const todasPlantillas = await prisma.$queryRaw`
      SELECT id, categoria FROM plantillas_productos
    `;

    for (const plantilla of todasPlantillas) {
      const categoriaId = categoriasCreadas[plantilla.categoria] || primeraCategoria.id;
      await prisma.$executeRaw`
        UPDATE plantillas_productos 
        SET "categoriaId" = ${categoriaId}
        WHERE id = ${plantilla.id}
      `;
      console.log(`  ✓ Plantilla ${plantilla.id} actualizada`);
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log(`📊 Total de categorías creadas: ${Object.keys(categoriasCreadas).length}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrarCategorias();

