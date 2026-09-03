// Datos de ejemplo que se muestran mientras no haya credenciales de API
// configuradas, para que el sitio se pueda ver y probar de inmediato.
// Se marcan claramente como "Ejemplo" y desaparecen solos apenas Adzuna
// (o TradeMe) estén conectados.

const now = new Date().toISOString();

const sampleJobs = [
  {
    id: 'ejemplo-1',
    source: 'Ejemplo',
    title: 'Vendedor/a part-time - tienda de retail',
    company: 'Tienda Demo Ltd',
    location: 'Auckland CBD',
    description:
      'Buscamos vendedor/a para turnos de tarde, 20 horas semanales. Experiencia en atención al cliente deseable.',
    url: '#',
    salaryMin: 24,
    salaryMax: 27,
    contractTime: 'part_time',
    postedAt: now,
    category: 'Retail',
  },
  {
    id: 'ejemplo-2',
    source: 'Ejemplo',
    title: 'Ayudante de cocina - fines de semana',
    company: 'Café Demo',
    location: 'Wellington',
    description:
      'Café buscando ayudante de cocina para sábados y domingos. Se valora experiencia previa en hospitality.',
    url: '#',
    salaryMin: 23,
    salaryMax: 25,
    contractTime: 'part_time',
    postedAt: now,
    category: 'Hospitality',
  },
  {
    id: 'ejemplo-3',
    source: 'Ejemplo',
    title: 'Cuidado de niños después del colegio',
    company: 'Familia particular',
    location: 'Christchurch',
    description:
      'Se busca persona de confianza para recoger a dos niños del colegio y cuidarlos hasta las 6pm, lunes a jueves.',
    url: '#',
    salaryMin: 25,
    salaryMax: 28,
    contractTime: 'part_time',
    postedAt: now,
    category: 'Childcare',
  },
  {
    id: 'ejemplo-4',
    source: 'Ejemplo',
    title: 'Repartidor/a - moto o auto propio',
    company: 'Delivery Demo',
    location: 'Hamilton',
    description:
      'Reparto de pedidos en horario flexible, ideal para complementar otros ingresos. Se requiere vehículo propio.',
    url: '#',
    salaryMin: 22,
    salaryMax: 26,
    contractTime: 'part_time',
    postedAt: now,
    category: 'Transporte y Reparto',
  },
];

module.exports = { sampleJobs };
