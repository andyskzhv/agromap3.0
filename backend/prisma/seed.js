const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await prisma.valoracion.deleteMany({});
  await prisma.comentario.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.mercado.deleteMany({});
  await prisma.plantillaProducto.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.usuario.deleteMany({});

  // Resetear las secuencias de auto-incremento
  console.log('🔄 Reseteando secuencias de IDs...');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE usuarios_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE categorias_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE plantillas_productos_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE mercados_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE productos_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE comentarios_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE valoraciones_id_seq RESTART WITH 1');

  // Crear contraseña hasheada para todos los usuarios
  const passwordHash = await bcrypt.hash('123456', 10);

  // ==================== USUARIOS ====================
  console.log('👥 Creando usuarios...');

  const admin = await prisma.usuario.create({
    data: {
      nombreUsuario: 'admin',
      contrasena: passwordHash,
      nombre: 'Administrador del Sistema',
      rol: 'ADMIN',
      provincia: 'La Habana'
    }
  });

  const gestores = await Promise.all([
    prisma.usuario.create({
      data: {
        nombreUsuario: 'gestor1',
        contrasena: passwordHash,
        nombre: 'Carlos Rodríguez',
        rol: 'GESTOR',
        provincia: 'Villa Clara'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'gestor2',
        contrasena: passwordHash,
        nombre: 'María González',
        rol: 'GESTOR',
        provincia: 'Sancti Spíritus'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'gestor3',
        contrasena: passwordHash,
        nombre: 'Jorge Fernández',
        rol: 'GESTOR',
        provincia: 'Villa Clara'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'gestor4',
        contrasena: passwordHash,
        nombre: 'Ana Martínez',
        rol: 'GESTOR',
        provincia: 'Matanzas'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'gestor5',
        contrasena: passwordHash,
        nombre: 'Luis Pérez',
        rol: 'GESTOR',
        provincia: 'Cienfuegos'
      }
    })
  ]);

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario1',
        contrasena: passwordHash,
        nombre: 'Pedro Sánchez',
        rol: 'USUARIO',
        provincia: 'Villa Clara'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario2',
        contrasena: passwordHash,
        nombre: 'Laura Díaz',
        rol: 'USUARIO',
        provincia: 'Sancti Spíritus'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario3',
        contrasena: passwordHash,
        nombre: 'Roberto Torres',
        rol: 'USUARIO',
        provincia: 'Matanzas'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario4',
        contrasena: passwordHash,
        nombre: 'Carmen López',
        rol: 'USUARIO',
        provincia: 'Villa Clara'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario5',
        contrasena: passwordHash,
        nombre: 'Miguel Ramírez',
        rol: 'USUARIO',
        provincia: 'Cienfuegos'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario6',
        contrasena: passwordHash,
        nombre: 'Isabel Castro',
        rol: 'USUARIO',
        provincia: 'Sancti Spíritus'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario7',
        contrasena: passwordHash,
        nombre: 'José Hernández',
        rol: 'USUARIO',
        provincia: 'Villa Clara'
      }
    }),
    prisma.usuario.create({
      data: {
        nombreUsuario: 'usuario8',
        contrasena: passwordHash,
        nombre: 'Rosa Morales',
        rol: 'USUARIO',
        provincia: 'Matanzas'
      }
    })
  ]);

  console.log(`✅ Creados: 1 admin, ${gestores.length} gestores, ${usuarios.length} usuarios`);

  // ==================== CATEGORÍAS ====================
  console.log('📂 Creando categorías...');

  const categorias = await Promise.all([
    prisma.categoria.create({
      data: {
        nombre: 'Frutas',
        descripcion: 'Frutas frescas y de temporada',
        activa: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Vegetales',
        descripcion: 'Vegetales y hortalizas frescas',
        activa: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Viandas',
        descripcion: 'Tubérculos y raíces',
        activa: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Granos',
        descripcion: 'Granos y legumbres',
        activa: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Condimentos',
        descripcion: 'Condimentos y especias',
        activa: true
      }
    })
  ]);

  console.log(`✅ Creadas ${categorias.length} categorías`);

  // ==================== PLANTILLAS ====================
  console.log('📋 Creando plantillas de productos...');

  const plantillas = await Promise.all([
    // Frutas
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Mango',
        descripcion: 'Mango fresco, variedad cubana. Rico en vitaminas A y C.',
        categoriaId: categorias[0].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Guayaba',
        descripcion: 'Guayaba fresca, excelente fuente de vitamina C.',
        categoriaId: categorias[0].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Piña',
        descripcion: 'Piña madura y dulce, ideal para jugos y postres.',
        categoriaId: categorias[0].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Aguacate',
        descripcion: 'Aguacate fresco, rico en grasas saludables.',
        categoriaId: categorias[0].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Plátano',
        descripcion: 'Plátano fresco, fuente natural de potasio.',
        categoriaId: categorias[0].id
      }
    }),
    // Vegetales
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Tomate',
        descripcion: 'Tomate fresco y jugoso, ideal para ensaladas y salsas.',
        categoriaId: categorias[1].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Lechuga',
        descripcion: 'Lechuga fresca y crujiente.',
        categoriaId: categorias[1].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Pepino',
        descripcion: 'Pepino fresco, perfecto para ensaladas.',
        categoriaId: categorias[1].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Calabaza',
        descripcion: 'Calabaza fresca, rica en vitamina A.',
        categoriaId: categorias[1].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Col',
        descripcion: 'Col o repollo fresco.',
        categoriaId: categorias[1].id
      }
    }),
    // Viandas
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Yuca',
        descripcion: 'Yuca fresca, alimento básico cubano.',
        categoriaId: categorias[2].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Boniato',
        descripcion: 'Boniato o batata dulce.',
        categoriaId: categorias[2].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Malanga',
        descripcion: 'Malanga fresca, tubérculo nutritivo.',
        categoriaId: categorias[2].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Papa',
        descripcion: 'Papa fresca, versátil para múltiples preparaciones.',
        categoriaId: categorias[2].id
      }
    }),
    // Granos
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Frijoles Negros',
        descripcion: 'Frijoles negros, base de la cocina cubana.',
        categoriaId: categorias[3].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Frijoles Colorados',
        descripcion: 'Frijoles colorados frescos.',
        categoriaId: categorias[3].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Maíz',
        descripcion: 'Maíz fresco o seco.',
        categoriaId: categorias[3].id
      }
    }),
    // Condimentos
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Ajo',
        descripcion: 'Ajo fresco, condimento esencial.',
        categoriaId: categorias[4].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Cebolla',
        descripcion: 'Cebolla fresca.',
        categoriaId: categorias[4].id
      }
    }),
    prisma.plantillaProducto.create({
      data: {
        nombre: 'Ají',
        descripcion: 'Ají picante o dulce.',
        categoriaId: categorias[4].id
      }
    })
  ]);

  console.log(`✅ Creadas ${plantillas.length} plantillas`);

  // ==================== MERCADOS ====================
  console.log('🏪 Creando mercados...');

  const mercados = await Promise.all([
    prisma.mercado.create({
      data: {
        nombre: 'Mercado Agropecuario Santa Clara',
        descripcion: 'Mercado principal de Santa Clara con amplia variedad de productos frescos.',
        provincia: 'Villa Clara',
        municipio: 'Santa Clara',
        direccion: 'Calle Independencia #50, Santa Clara',
        latitud: 22.4071,
        longitud: -79.9647,
        gestorId: gestores[0].id
      }
    }),
    prisma.mercado.create({
      data: {
        nombre: 'Agromercado El Uvero',
        descripcion: 'Mercado local con productos de agricultores de la zona.',
        provincia: 'Villa Clara',
        municipio: 'Placetas',
        direccion: 'Avenida Principal, Placetas',
        latitud: 22.3103,
        longitud: -79.6547,
        gestorId: gestores[2].id
      }
    }),
    prisma.mercado.create({
      data: {
        nombre: 'Mercado La Plaza',
        descripcion: 'Mercado céntrico de Sancti Spíritus.',
        provincia: 'Sancti Spíritus',
        municipio: 'Sancti Spíritus',
        direccion: 'Calle Llano #120',
        latitud: 21.9297,
        longitud: -79.4428,
        gestorId: gestores[1].id
      }
    }),
    prisma.mercado.create({
      data: {
        nombre: 'Agromercado Trinidad',
        descripcion: 'Mercado turístico de Trinidad con productos orgánicos.',
        provincia: 'Sancti Spíritus',
        municipio: 'Trinidad',
        direccion: 'Calle Real del Jigüe',
        latitud: 21.8020,
        longitud: -79.9847,
        gestorId: gestores[1].id
      }
    }),
    prisma.mercado.create({
      data: {
        nombre: 'Mercado de Matanzas',
        descripcion: 'Mercado principal de la provincia de Matanzas.',
        provincia: 'Matanzas',
        municipio: 'Matanzas',
        direccion: 'Calle 79 entre 270 y 272',
        latitud: 23.0415,
        longitud: -81.5775,
        gestorId: gestores[3].id
      }
    }),
    prisma.mercado.create({
      data: {
        nombre: 'Agromercado Cienfuegos Centro',
        descripcion: 'Mercado en el centro histórico de Cienfuegos.',
        provincia: 'Cienfuegos',
        municipio: 'Cienfuegos',
        direccion: 'Avenida 54 esquina 31',
        latitud: 22.1467,
        longitud: -80.4392,
        gestorId: gestores[4].id
      }
    })
  ]);

  console.log(`✅ Creados ${mercados.length} mercados`);

  // ==================== PRODUCTOS ====================
  console.log('🥬 Creando productos...');

  const productos = [];

  // Helper para crear productos
  const crearProducto = async (mercado, plantilla, datos) => {
    return await prisma.producto.create({
      data: {
        nombre: plantilla.nombre,
        descripcion: datos.descripcion || plantilla.descripcion,
        cantidad: datos.cantidad,
        unidadMedida: datos.unidadMedida,
        precio: datos.precio,
        unidadPrecio: datos.unidadPrecio,
        categoriaId: plantilla.categoriaId,
        tipoProducto: datos.tipoProducto,
        estado: 'DISPONIBLE',
        mercadoId: mercado.id,
        plantillaId: plantilla.id,
        imagenes: []
      }
    });
  };

  // Mercado Santa Clara - variedad completa
  for (let i = 0; i < 15; i++) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[0], plantilla, {
      cantidad: Math.random() * 100 + 10,
      unidadMedida: i < 5 ? 'UNIDAD' : (i < 10 ? 'KG' : (i < 14 ? 'LB' : 'KG')),
      precio: Math.random() * 50 + 10,
      unidadPrecio: i < 5 ? 'UNIDAD' : 'KG',
      tipoProducto: Math.random() > 0.5 ? 'Orgánico' : null
    }));
  }

  // Mercado El Uvero - productos selectos
  for (let i of [0, 1, 5, 6, 10, 11, 14, 17, 18]) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[1], plantilla, {
      cantidad: Math.random() * 80 + 15,
      unidadMedida: i < 5 ? 'UNIDAD' : 'KG',
      precio: Math.random() * 45 + 12,
      unidadPrecio: i < 5 ? 'UNIDAD' : 'KG',
      tipoProducto: 'Cosecha local'
    }));
  }

  // Mercado La Plaza - productos variados
  for (let i of [0, 2, 3, 5, 7, 10, 12, 14, 15, 18, 19]) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[2], plantilla, {
      cantidad: Math.random() * 90 + 20,
      unidadMedida: i < 5 ? 'UNIDAD' : 'LB',
      precio: Math.random() * 40 + 15,
      unidadPrecio: i < 5 ? 'UNIDAD' : 'LB',
      tipoProducto: Math.random() > 0.7 ? 'Premium' : null
    }));
  }

  // Mercado Trinidad - productos orgánicos
  for (let i of [0, 1, 3, 4, 6, 8, 11, 17, 18]) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[3], plantilla, {
      cantidad: Math.random() * 60 + 10,
      unidadMedida: 'KG',
      precio: Math.random() * 60 + 20,
      unidadPrecio: 'KG',
      tipoProducto: 'Orgánico Certificado'
    }));
  }

  // Mercado Matanzas - buen surtido
  for (let i of [1, 2, 4, 5, 6, 9, 10, 13, 14, 16]) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[4], plantilla, {
      cantidad: Math.random() * 85 + 25,
      unidadMedida: i < 5 ? 'UNIDAD' : 'KG',
      precio: Math.random() * 48 + 18,
      unidadPrecio: i < 5 ? 'UNIDAD' : 'KG'
    }));
  }

  // Mercado Cienfuegos - productos frescos
  for (let i of [0, 3, 5, 7, 8, 11, 12, 15, 17, 19]) {
    const plantilla = plantillas[i];
    productos.push(await crearProducto(mercados[5], plantilla, {
      cantidad: Math.random() * 75 + 15,
      unidadMedida: 'LB',
      precio: Math.random() * 42 + 16,
      unidadPrecio: 'LB',
      tipoProducto: 'Fresco del día'
    }));
  }

  console.log(`✅ Creados ${productos.length} productos`);

  // ==================== VALORACIONES ====================
  console.log('⭐ Creando valoraciones...');

  let valoracionesCreadas = 0;
  const valoracionesRegistradas = new Set();

  for (const producto of productos) {
    // Crear entre 2 y 8 valoraciones por producto
    const numValoraciones = Math.floor(Math.random() * 7) + 2;
    const usuariosDisponibles = [...usuarios];

    for (let i = 0; i < numValoraciones && usuariosDisponibles.length > 0; i++) {
      // Seleccionar usuario aleatorio y removerlo de disponibles
      const indexUsuario = Math.floor(Math.random() * usuariosDisponibles.length);
      const usuario = usuariosDisponibles.splice(indexUsuario, 1)[0];

      const clave = `${usuario.id}-${producto.id}`;
      if (!valoracionesRegistradas.has(clave)) {
        const estrellas = Math.floor(Math.random() * 3) + 3; // Entre 3 y 5 estrellas

        await prisma.valoracion.create({
          data: {
            usuarioId: usuario.id,
            productoId: producto.id,
            estrellas
          }
        });
        valoracionesRegistradas.add(clave);
        valoracionesCreadas++;
      }
    }
  }

  console.log(`✅ Creadas ${valoracionesCreadas} valoraciones`);

  // ==================== COMENTARIOS ====================
  console.log('💬 Creando comentarios...');

  const comentariosTexto = [
    'Excelente calidad, muy fresco y buen precio.',
    'Producto de primera calidad, lo recomiendo totalmente.',
    'Muy buenos productos, el mercado siempre tiene buen surtido.',
    'Precio justo y buena atención.',
    'Los mejores de la zona, siempre compro aquí.',
    'Calidad superior, productos muy frescos.',
    'Buena relación calidad-precio.',
    'Recomendado 100%, siempre encuentro lo que busco.',
    'Productos frescos del día, excelente.',
    'Muy satisfecho con la compra, volveré.',
    'Buen producto aunque un poco caro.',
    'Calidad aceptable, buenos precios.',
    'Me gusta comprar aquí, siempre hay variedad.',
    'Productos orgánicos de calidad.',
    'Frescos y sabrosos, ideales para la familia.'
  ];

  let comentariosCreados = 0;
  const comentariosRegistrados = new Set();

  for (const producto of productos) {
    // Crear entre 1 y 5 comentarios por producto
    const numComentarios = Math.floor(Math.random() * 5) + 1;
    const usuariosDisponibles = [...usuarios];

    for (let i = 0; i < numComentarios && usuariosDisponibles.length > 0; i++) {
      // Seleccionar usuario aleatorio y removerlo de disponibles
      const indexUsuario = Math.floor(Math.random() * usuariosDisponibles.length);
      const usuario = usuariosDisponibles.splice(indexUsuario, 1)[0];

      const clave = `${usuario.id}-${producto.id}`;
      if (!comentariosRegistrados.has(clave)) {
        const texto = comentariosTexto[Math.floor(Math.random() * comentariosTexto.length)];
        const recomienda = Math.random() > 0.3; // 70% recomienda
        const likes = Math.floor(Math.random() * 15);

        await prisma.comentario.create({
          data: {
            usuarioId: usuario.id,
            productoId: producto.id,
            texto,
            recomienda,
            likes
          }
        });
        comentariosRegistrados.add(clave);
        comentariosCreados++;
      }
    }
  }

  console.log(`✅ Creados ${comentariosCreados} comentarios`);

  console.log('\n✨ ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - Usuarios: ${1 + gestores.length + usuarios.length} (1 admin, ${gestores.length} gestores, ${usuarios.length} usuarios)`);
  console.log(`   - Categorías: ${categorias.length}`);
  console.log(`   - Plantillas: ${plantillas.length}`);
  console.log(`   - Mercados: ${mercados.length}`);
  console.log(`   - Productos: ${productos.length}`);
  console.log(`   - Valoraciones: ${valoracionesCreadas}`);
  console.log(`   - Comentarios: ${comentariosCreados}`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Admin: usuario="admin", contraseña="123456"');
  console.log('   Gestores: usuario="gestor1" a "gestor5", contraseña="123456"');
  console.log('   Usuarios: usuario="usuario1" a "usuario8", contraseña="123456"');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
