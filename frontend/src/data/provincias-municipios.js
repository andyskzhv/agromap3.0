// Provincias y municipios de Cuba
export const provinciasYMunicipios = {
  "Pinar del Río": [
    "Consolación del Sur",
    "Guane",
    "La Palma",
    "Los Palacios",
    "Mantua",
    "Minas de Matahambre",
    "Pinar del Río",
    "San Juan y Martínez",
    "San Luis",
    "Sandino",
    "Viñales"
  ],
  "Artemisa": [
    "Alquízar",
    "Artemisa",
    "Bahía Honda",
    "Bauta",
    "Caimito",
    "Candelaria",
    "Guanajay",
    "Güira de Melena",
    "Mariel",
    "San Antonio de los Baños",
    "San Cristóbal"
  ],
  "La Habana": [
    "Arroyo Naranjo",
    "Boyeros",
    "Centro Habana",
    "Cerro",
    "Cotorro",
    "Diez de Octubre",
    "Guanabacoa",
    "La Habana del Este",
    "La Habana Vieja",
    "La Lisa",
    "Marianao",
    "Playa",
    "Plaza de la Revolución",
    "Regla",
    "San Miguel del Padrón"
  ],
  "Mayabeque": [
    "Batabanó",
    "Bejucal",
    "Güines",
    "Jaruco",
    "Madruga",
    "Melena del Sur",
    "Nueva Paz",
    "Quivicán",
    "San José de las Lajas",
    "San Nicolás",
    "Santa Cruz del Norte"
  ],
  "Matanzas": [
    "Calimete",
    "Cárdenas",
    "Ciénaga de Zapata",
    "Colón",
    "Jagüey Grande",
    "Jovellanos",
    "Limonar",
    "Los Arabos",
    "Martí",
    "Matanzas",
    "Pedro Betancourt",
    "Perico",
    "Unión de Reyes"
  ],
  "Cienfuegos": [
    "Abreus",
    "Aguada de Pasajeros",
    "Cienfuegos",
    "Cruces",
    "Cumanayagua",
    "Palmira",
    "Rodas",
    "Santa Isabel de las Lajas"
  ],
  "Villa Clara": [
    "Caibarién",
    "Camajuaní",
    "Cifuentes",
    "Corralillo",
    "Encrucijada",
    "Manicaragua",
    "Placetas",
    "Quemado de Güines",
    "Ranchuelo",
    "Remedios",
    "Sagua la Grande",
    "Santa Clara",
    "Santo Domingo"
  ],
  "Sancti Spíritus": [
    "Cabaiguán",
    "Fomento",
    "Jatibonico",
    "La Sierpe",
    "Sancti Spíritus",
    "Taguasco",
    "Trinidad",
    "Yaguajay"
  ],
  "Ciego de Ávila": [
    "Baraguá",
    "Bolivia",
    "Chambas",
    "Ciego de Ávila",
    "Ciro Redondo",
    "Florencia",
    "Majagua",
    "Morón",
    "Primero de Enero",
    "Venezuela"
  ],
  "Camagüey": [
    "Camagüey",
    "Carlos Manuel de Céspedes",
    "Esmeralda",
    "Florida",
    "Guáimaro",
    "Jimaguayú",
    "Minas",
    "Najasa",
    "Nuevitas",
    "Santa Cruz del Sur",
    "Sibanicú",
    "Sierra de Cubitas",
    "Vertientes"
  ],
  "Las Tunas": [
    "Amancio",
    "Colombia",
    "Jesús Menéndez",
    "Jobabo",
    "Las Tunas",
    "Majibacoa",
    "Manatí",
    "Puerto Padre"
  ],
  "Holguín": [
    "Antilla",
    "Báguanos",
    "Banes",
    "Cacocum",
    "Calixto García",
    "Cueto",
    "Frank País",
    "Gibara",
    "Holguín",
    "Mayarí",
    "Moa",
    "Rafael Freyre",
    "Sagua de Tánamo",
    "Urbano Noris"
  ],
  "Granma": [
    "Bartolomé Masó",
    "Bayamo",
    "Buey Arriba",
    "Campechuela",
    "Cauto Cristo",
    "Guisa",
    "Jiguaní",
    "Manzanillo",
    "Media Luna",
    "Niquero",
    "Pilón",
    "Río Cauto",
    "Yara"
  ],
  "Santiago de Cuba": [
    "Contramaestre",
    "Guamá",
    "Mella",
    "Palma Soriano",
    "San Luis",
    "Santiago de Cuba",
    "Segundo Frente",
    "Songo-La Maya",
    "Tercer Frente"
  ],
  "Guantánamo": [
    "Baracoa",
    "Caimanera",
    "El Salvador",
    "Guantánamo",
    "Imías",
    "Maisí",
    "Manuel Tames",
    "Niceto Pérez",
    "San Antonio del Sur",
    "Yateras"
  ],
  "Isla de la Juventud": [
    "Isla de la Juventud"
  ]
};

// Listado solo de provincias
export const provincias = Object.keys(provinciasYMunicipios);

// Función helper para obtener municipios de una provincia
export const getMunicipiosPorProvincia = (provincia) => {
  return provinciasYMunicipios[provincia] || [];
};
