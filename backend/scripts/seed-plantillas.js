const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantillasBase = [
  {
    nombre: 'Tomate',
    descripcion: 'Tomate fresco y jugoso, ideal para ensaladas y salsas',
    categoria: 'Verduras',
    imagen: null
  },
  {
    nombre: 'Lechuga',
    descripcion: 'Lechuga fresca y crujiente, perfecta para ensaladas',
    categoria: 'Verduras',
    imagen: null
  },
  {
    nombre: 'Plátano',
    descripcion: 'Plátano maduro, rico en potasio y sabor',
    categoria: 'Frutas',
    imagen: null
  },
  {
    nombre: 'Mango',
    descripcion: 'Mango dulce y jugoso, fruta tropical por excelencia',
    categoria: 'Frutas',
    imagen: null
  },
  {
    nombre: 'Cebolla',
    descripcion: 'Cebolla fresca, ingrediente básico de la cocina',
    categoria: 'Verduras',
    imagen: null
  },
  {
    nombre: 'Aguacate',
    descripcion: 'Aguacate cremoso, rico en grasas saludables',
    categoria: 'Frutas',
    imagen: null
  },
  {
    nombre: 'Zanahoria',
    descripcion: 'Zanahoria fresca y crujiente, rica en vitamina A',
    categoria: 'Verduras',
    imagen: null
  },
  {
    nombre: 'Naranja',
    descripcion: 'Naranja jugosa, excelente fuente de vitamina C',
    categoria: 'Frutas',
    imagen: null
  },
  {
    nombre: 'Papa',
    descripcion: 'Papa fresca, versátil para múltiples preparaciones',
    categoria: 'Tubérculos',
    imagen: null
  },
  {
    nombre: 'Yuca',
    descripcion: 'Yuca fresca, base de la alimentación tradicional',
    categoria: 'Tubérculos',
    imagen: null
  },
  {
    nombre: 'Pollo',
    descripcion: 'Pollo fresco de granja, fuente de proteína',
    categoria: 'Carnes',
    imagen: null
  },
  {
    nombre: 'Cerdo',
    descripcion: 'Carne de cerdo fresca, jugosa y sabrosa',
    categoria: 'Carnes',
    imagen: null
  },
  {
    nombre: 'Queso',
    descripcion: 'Queso fresco artesanal, rico en calcio',
    categoria: 'Lácteos',
    imagen: null
  },
  {
    nombre: 'Leche',
    descripcion: 'Leche fresca de vaca, rica y nutritiva',
    categoria: 'Lácteos',
    imagen: null
  },
  {
    nombre: 'Huevos',
    descripcion: 'Huevos frescos de gallina, proteína de alta calidad',
    categoria: 'Lácteos',
    imagen: null
  }
];

async function seedPlantillas() {
  try {
    console.log('🌱 Iniciando seed de plantillas...');

    for (const plantilla of plantillasBase) {
      const existe = await prisma.plantillaProducto.findFirst({
        where: { nombre: plantilla.nombre }
      });

      if (!existe) {
        await prisma.plantillaProducto.create({
          data: plantilla
        });
        console.log(`✅ Plantilla creada: ${plantilla.nombre}`);
      } else {
        console.log(`⏭️  Plantilla ya existe: ${plantilla.nombre}`);
      }
    }

    console.log('🎉 Seed completado!');
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlantillas();