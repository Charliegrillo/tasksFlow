import type { Db } from './connection'

const contactData: [string, string, string, string, string, string, string, string][] = [
  ['María García López', 'maria.garcia@techsolutions.mx', '+52 55 1234 5678', 'TechSolutions MX', 'Directora de Marketing', 'Av. Reforma 255, CDMX', 'https://techsolutions.mx', 'Contacto principal para campañas digitales'],
  ['Juan Carlos Ramírez', 'jc.ramirez@innovaweb.com', '+52 55 2345 6789', 'InnovaWeb', 'Gerente de Ventas', 'Calle Juárez 120, CDMX', 'https://innovaweb.com', 'Interesado en paquete empresarial'],
  ['Ana Sofía Hernández', 'ana.hernandez@globalcorp.mx', '+52 55 3456 7890', 'GlobalCorp', 'CTO', 'Blvd. Insurgentes 500, CDMX', 'https://globalcorp.mx', 'Decisión técnica sobre integraciones'],
  ['Roberto Martínez Vega', 'r.martinez@digitalstudio.io', '+52 33 4567 8901', 'Digital Studio', 'Director Creativo', 'Av. Vallarta 300, Guadalajara', 'https://digitalstudio.io', 'Proyectos de branding'],
  ['Laura Castillo Díaz', 'laura.castillo@softdev.mx', '+52 81 5678 9012', 'SoftDev', 'Líder de Proyecto', 'Av. Constitución 100, Monterrey', 'https://softdev.mx', 'Migración de plataforma en curso'],
  ['Fernando Ruiz Ortega', 'f.ruiz@mediapro.com.mx', '+52 55 6789 0123', 'MediaPro', 'Productor Ejecutivo', 'Calle Madero 85, CDMX', 'https://mediapro.com.mx', 'Producción de contenido audiovisual'],
  ['Patricia Morales Silva', 'patricia.m@ecoplus.com', '+52 55 7890 1234', 'EcoPlus', 'Gerente General', 'Av. Insurgentes Sur 1200, CDMX', 'https://ecoplus.com', 'Línea sustentable - interés alto'],
  ['Diego López Navarro', 'diego.lopez@startuplab.mx', '+52 55 8901 2345', 'StartupLab', 'Fundador', 'Calle Córdoba 45, Roma Norte, CDMX', 'https://startuplab.mx', 'Aceleradora de startups'],
  ['Sofía Ramos Flores', 'sofia.ramos@finanzasgp.com', '+52 55 9012 3456', 'FinanzasGP', 'Directora Financiera', 'Paseo de la Reforma 350, CDMX', 'https://finanzasgp.com', 'Análisis de costos pendiente'],
  ['Carlos Mendoza Torres', 'carlos.mendoza@logistik.mx', '+52 81 0123 4567', 'Logistik MX', 'Jefe de Operaciones', 'Av. Universidad 500, Monterrey', 'https://logistik.mx', 'Logística y cadenas de suministro'],
  ['Isabel Vargas Reyes', 'isabel.vargas@creativehub.io', '+52 33 1234 5678', 'CreativeHub', 'Diseñadora UX/UI', 'Calle Independencia 200, Guadalajara', 'https://creativehub.io', 'Diseño de interfaz para app móvil'],
  ['Miguel Ángel Orozco', 'm.orozco@industriasbay.mx', '+52 33 2345 6789', 'Industrias Bay', 'Director de Planta', 'Zona Industrial, Zapopan', 'https://industriasbay.mx', 'Sector manufacturero - NDA firmado'],
  ['Valentina Cruz Peña', 'valentina.cruz@agenciadigital.com', '+52 55 3456 7890', 'Agencia Digital', 'Social Media Manager', 'Condesa, CDMX', 'https://agenciadigital.com', 'Gestión de redes sociales'],
  ['Alejandro Jiménez Salas', 'a.jimenez@constructuramax.mx', '+52 55 4567 8901', 'ConstruMax', 'Arquitecto Lead', 'Av. Toluca 150, CDMX', 'https://constructuramax.mx', 'Proyectos de oficinas corporativas'],
  ['Camila Torres Blanco', 'camila.torres@nutritech.com', '+52 55 5678 9012', 'NutriTech', 'Directora de I+D', 'Ciudad de México', 'https://nutritech.com', 'Desarrollo de productos saludables'],
  ['Ricardo Pineda Castro', 'ricardo.pineda@seguridadtotal.mx', '+52 55 6789 0123', 'SeguridadTotal', 'Gerente de Ventas', 'Calle Sur 80, CDMX', 'https://seguridadtotal.mx', 'Soluciones de ciberseguridad'],
  ['Fernanda Domínguez Ríos', 'fernanda.d@educaplus.org', '+52 55 7890 1234', 'EducaPlus', 'Directora Académica', 'Av. Universidad 200, CDMX', 'https://educaplus.org', 'Plataforma e-learning'],
  ['Javier Herrera Luna', 'j.herrera@transportesgl.com', '+52 81 8901 2345', 'Transportes GL', 'Director Comercial', 'Av. Constitución 800, Monterrey', 'https://transportesgl.com', 'Transporte de carga pesada'],
  ['Daniela Aguilar Medina', 'daniela.aguilar@modainterior.com', '+52 33 9012 3456', 'Moda Interior', 'Diseñadora de Moda', 'Zona Centro, Guadalajara', 'https://modainterior.com', 'Línea de moda contemporánea'],
  ['Enrique Salazar Mora', 'e.salazar@biofarm.mx', '+52 55 0123 4567', 'BioFarm', 'Director Científico', 'Zona de Ciencias, CDMX', 'https://biofarm.mx', 'Farmacéutica - estudios clínicos'],
  ['Paula Ríos Delgado', 'paula.rios@cloudnine.mx', '+52 55 1234 5679', 'CloudNine', 'DevOps Lead', 'CDMX', 'https://cloudnine.mx', 'Infraestructura cloud'],
  ['Andrés Castillo Romero', 'a.castillo@proteccionmax.com', '+52 55 2345 6780', 'ProtecciónMax', 'Jefe de Seguridad', 'CDMX', 'https://proteccionmax.com', 'Servicios de vigilancia'],
  ['Gabriela Flores Quintana', 'g.flores@alimentosdelvalle.mx', '+52 55 3456 7891', 'Alimentos del Valle', 'Directora de Exportaciones', 'Puebla', 'https://alimentosdelvalle.mx', 'Exportación de alimentos procesados'],
  ['Luis Fernando Soto', 'l.soto@automatizaind.mx', '+52 81 4567 8902', 'AutomatizaInd', 'Ingeniero de Automatización', 'Monterrey', 'https://automatizaind.mx', 'Sistemas industriales automatizados'],
  ['Mariana Leal Peña', 'm.leal@arquitecturaverde.com', '+52 33 5678 9013', 'Arquitectura Verde', 'Socia Fundadora', 'Guadalajara', 'https://arquitecturaverde.com', 'Arquitectura sustentable'],
  ['Rogelio Garza Fuentes', 'r.garza@steeltech.mx', '+52 81 6789 0124', 'SteelTech', 'Gerente de Producción', 'Monterrey', 'https://steeltech.mx', 'Manufactura de acero especial'],
  ['Adriana Luna Carrillo', 'a.luna@viajespremium.com', '+52 55 7890 1235', 'Viajes Premium', 'Directora de Experiencias', 'CDMX', 'https://viajespremium.com', 'Turismo de lujo corporativo'],
  ['Óscar Domínguez Sandoval', 'o.dominguez@codecraft.mx', '+52 55 8901 2346', 'CodeCraft', 'CTO', 'CDMX', 'https://codecraft.mx', 'Desarrollo de software a medida'],
  ['Ximena Reyes Salinas', 'x.reyes@marketingpro.com', '+52 55 9012 3457', 'MarketingPro', 'Directora de Estrategia', 'CDMX', 'https://marketingpro.com', 'Campañas B2B'],
  ['Héctor Navarro Velasco', 'h.navarro@industrialpark.mx', '+52 81 0123 4568', 'IndustrialPark', 'Director de Inmuebles', 'Monterrey', 'https://industrialpark.mx', 'Parques industriales'],
  ['Teresa Ortiz Guzmán', 't.ortiz@labmed.mx', '+52 55 1234 5680', 'LabMed', 'Directora de Laboratorio', 'CDMX', 'https://labmed.mx', 'Diagnóstico médico avanzado'],
  ['Francisco Contreras Blasco', 'f.contreras@energialimpia.com', '+52 55 2345 6781', 'EnergíaLimpia', 'Director de Proyectos', 'CDMX', 'https://energialimpia.com', 'Energías renovables - solar'],
  ['Claudia Peñaloza Ríos', 'c.penaloza@eventoscorporativos.mx', '+52 55 3456 7892', 'Eventos Corp', 'Productora de Eventos', 'CDMX', 'https://eventoscorporativos.mx', 'Eventos empresariales y conferencias'],
  ['Armando Villanueva Sosa', 'a.villanueva@segurosintegrales.com', '+52 55 4567 8903', 'Seguros Integrales', 'Agente Senior', 'CDMX', 'https://segurosintegrales.com', 'Pólizas corporativas'],
  ['Brenda Rangel Torres', 'b.rangel@dataminds.mx', '+52 55 5678 9014', 'DataMinds', 'Científica de Datos', 'CDMX', 'https://dataminds.mx', 'Machine learning aplicado'],
  ['Roberto Garza Elizondo', 'r.garza@mobiliariocorp.com', '+52 81 6789 0125', 'MobiliarioCorp', 'Director de Ventas', 'Monterrey', 'https://mobiliariocorp.com', 'Mobiliario corporativo'],
  ['Lucía Fuentes Maldonado', 'l.fuentes@saludtotal.mx', '+52 55 7890 1236', 'SaludTotal', 'Gerente de Clínica', 'CDMX', 'https://saludtotal.mx', 'Clínica multiservicios'],
  ['Jorge Alonso Rivas', 'j.alonso@telecomscorp.com', '+52 55 8901 2347', 'TelecomsCorp', 'Director de Infraestructura', 'CDMX', 'https://telecomscorp.com', 'Redes y telecomunicaciones'],
  ['Ana Luisa Cardona', 'a.cardona@biotechgen.mx', '+52 55 9012 3458', 'BioTechGen', 'Directora de Biotecnología', 'CDMX', 'https://biotechgen.mx', 'Biotecnología agrícola'],
  ['Raúl Esquivel Domínguez', 'r.esquivel@construccionesmerito.mx', '+52 33 0123 4569', 'Construcciones Mérito', 'Superintendente', 'Guadalajara', 'https://construccionesmerito.mx', 'Construcción civil'],
  ['Gloria Sánchez Palacios', 'g.sanchez@fintechplus.com', '+52 55 1234 5681', 'FintechPlus', 'Directora de Producto', 'CDMX', 'https://fintechplus.com', 'Fintech - pagos digitales'],
  ['Iván Morales Aguilar', 'i.morales@agroindustrial.mx', '+52 81 2345 6782', 'AgroIndustrial', 'Gerente de Exportación', 'Monterrey', 'https://agroindustrial.mx', 'Agricultura de precisión'],
  ['Susana Cabrera Leal', 's.cabrera@designstudio.io', '+52 33 3456 7893', 'DesignStudio', 'Directora de Arte', 'Guadalajara', 'https://designstudio.io', 'Branding y diseño gráfico'],
  ['Manuel Herrera Figueroa', 'm.herrera@petroquimicamx.com', '+52 81 4567 8904', 'Petroquímica MX', 'Director de Planta', 'Monterrey', 'https://petroquimicamx.com', 'Petroquímica - certificaciones pendientes'],
  ['Liliana Vega Contreras', 'l.vega@modaverde.mx', '+52 55 5678 9015', 'ModaVerde', 'Fundadora', 'CDMX', 'https://modaverde.mx', 'Moda sustentable - tienda online'],
  ['Gustavo Ríos Paredes', 'g.rios@seguridadindustrial.com', '+52 81 6789 0126', 'SeguridadIndustrial', 'Director Técnico', 'Monterrey', 'https://seguridadindustrial.com', 'EPP y seguridad laboral'],
  ['Natalia Orozco Vega', 'n.orozco@hostingmx.com', '+52 55 7890 1237', 'HostingMX', 'Directora de Operaciones', 'CDMX', 'https://hostingmx.com', 'Hosting y data center'],
  ['Raúl Ponce de León', 'r.ponce@farmaciasalud.mx', '+52 55 8901 2348', 'Farmacia Salud', 'Farmacéutico Titular', 'CDMX', 'https://farmaciasalud.mx', 'Cadena de farmacias'],
  ['Adriana Flores Quintero', 'a.flores@publicidad360.com', '+52 55 9012 3459', 'Publicidad360', 'Directora Creativa', 'CDMX', 'https://publicidad360.com', 'Agencia de publicidad integral'],
  ['Francisco J. Moreno', 'fj.moreno@transportesurgentes.mx', '+52 81 0123 4570', 'Transportes Urgentes', 'Gerente de Flota', 'Monterrey', 'https://transportesurgentes.mx', 'Paquetería express'],
  ['Diana Peralta Sandoval', 'd.peralta@cloudhost.mx', '+52 55 1234 5682', 'CloudHost', 'DevOps Engineer', 'CDMX', 'https://cloudhost.mx', 'Servidores cloud'],
  ['Sergio Beltrán Núñez', 's.beltran@arquitecturacorp.com', '+52 55 2345 6783', 'ArquitecturaCorp', 'Director de Diseño', 'CDMX', 'https://arquitecturacorp.com', 'Arquitectura comercial'],
  ['Mónica Salinas Díaz', 'm.salinas@inversionesalto.mx', '+52 55 3456 7894', 'Inversiones Alto', 'Directora de Inversiones', 'CDMX', 'https://inversionesalto.mx', 'Fondos de inversión'],
  ['Eduardo Cabrera Ruiz', 'e.cabrera@roboticaindustrial.mx', '+52 81 4567 8905', 'Robótica Industrial', 'Director de Ingeniería', 'Monterrey', 'https://roboticaindustrial.mx', 'Automatización y robótica'],
  ['Verónica Lugo Castillo', 'v.lugo@clinicaestetica.com', '+52 55 5678 9016', 'Clínica Estética', 'Directora Médica', 'CDMX', 'https://clinicaestetica.com', 'Medicina estética'],
  ['César Monroy Peña', 'c.monroy@logisticapro.mx', '+52 81 6789 0127', 'LogísticaPro', 'Director de Cadena de Suministro', 'Monterrey', 'https://logisticapro.mx', 'Logística 3PL'],
  ['Laura Esmeralda Ríos', 'le.rios@educaciondigital.mx', '+52 55 7890 1238', 'EducaciónDigital', 'Directora de Contenido', 'CDMX', 'https://educaciondigital.mx', 'Plataformas educativas'],
  ['Ángel Herrera Cortés', 'a.herrera@construccionesmodernas.mx', '+52 55 8901 2349', 'Construcciones Modernas', 'Gerente de Obra', 'CDMX', 'https://construccionesmodernas.mx', 'Construcción residencial'],
  ['Daniela Rojas Mendoza', 'd.rojas@marketplaceplus.com', '+52 55 9012 3460', 'MarketplacePlus', 'Directora de Operaciones', 'CDMX', 'https://marketplaceplus.com', 'Marketplace B2B'],
  ['Fernando Villarreal Orozco', 'f.villarreal@biochem.mx', '+52 81 0123 4571', 'BioChem', 'Director de Investigación', 'Monterrey', 'https://biochem.mx', 'Química farmacéutica'],
  ['Patricia Garza Salinas', 'p.garza@arquitectos.asociados.mx', '+52 81 2345 6784', 'Arquitectos Asociados', 'Socia Directora', 'Monterrey', 'https://arquitectos.asociados.mx', 'Proyectos de oficinas'],
  ['Ricardo Luna Flores', 'r.luna@tecnologiaservicio.mx', '+52 55 3456 7895', 'TecnologíaServicio', 'Director Comercial', 'CDMX', 'https://tecnologiaservicio.mx', 'Outsourcing de TI'],
  ['Mariana Estrada Campos', 'm.estrada@farmaonline.mx', '+52 55 4567 8906', 'FarmaOnline', 'Directora General', 'CDMX', 'https://farmaonline.mx', 'Farmacia en línea'],
  ['Alejandro Rivas Ponce', 'a.rivas@ingenieria.mx', '+52 33 5678 9017', 'Ingeniería MX', 'Ingeniero Civil', 'Guadalajara', 'https://ingenieria.mx', 'Ingeniería estructural'],
  ['Sandra Leal Domínguez', 's.leal@comercioexterior.com', '+52 55 6789 0128', 'ComercioExterior', 'Agente Aduanal', 'CDMX', 'https://comercioexterior.com', 'Importación y exportación'],
  ['Javier Morales Blanco', 'j.morales@techstartup.mx', '+52 55 7890 1239', 'TechStartup', 'CEO', 'CDMX', 'https://techstartup.mx', 'Startup de IA'],
  ['Gabriela Orozco Salazar', 'g.orozco@mediosdigitales.com', '+52 55 8901 2350', 'MediosDigitales', 'Directora de Contenido', 'CDMX', 'https://mediosdigitales.com', 'Producción de contenido digital'],
  ['Óscar Domínguez Reyes', 'o.dominguez@industrial.mx', '+52 81 9012 3461', 'Industrial MX', 'Jefe de Mantenimiento', 'Monterrey', 'https://industrial.mx', 'Mantenimiento industrial'],
  ['Ximena Garza Flores', 'x.garza@seguros.mx', '+52 81 0123 4572', 'Seguros MX', 'Corredora de Seguros', 'Monterrey', 'https://seguros.mx', 'Seguros empresariales'],
  ['Manuel Castillo Ríos', 'm.castillo@transporte.com', '+52 55 1234 5683', 'Transporte MX', 'Director de Flota', 'CDMX', 'https://transporte.com', 'Flota de transporte de personal'],
  ['Laura Rangel Martínez', 'l.rangel@consultoria.mx', '+52 55 2345 6785', 'Consultoría MX', 'Consultora Senior', 'CDMX', 'https://consultoria.mx', 'Consultoría estratégica'],
]

export async function runSeed(db: Db): Promise<void> {
  const clientCount = await db.prepare('SELECT COUNT(*) AS count FROM clients').get() as { count: number }
  if (clientCount.count === 0) {
    await db.prepare("INSERT INTO clients (name, email, company) VALUES (?, ?, ?)").run('Cliente Demo', 'demo@example.com', 'Empresa Demo')
  }

  const spaceCount = await db.prepare('SELECT COUNT(*) AS count FROM spaces').get() as { count: number }
  let defaultSpaceId: number
  if (spaceCount.count === 0) {
    const result = await db.prepare("INSERT INTO spaces (name, color) VALUES (?, ?)").run('Espacio Demo', 'bg-violet-500')
    defaultSpaceId = result.lastInsertRowid
  } else {
    const space = await db.prepare('SELECT id FROM spaces LIMIT 1').get() as { id: number }
    defaultSpaceId = space.id
  }

  const boardCount = await db.prepare('SELECT COUNT(*) AS count FROM boards').get() as { count: number }
  let defaultBoardId: number
  if (boardCount.count === 0) {
    const result = await db.prepare("INSERT INTO boards (name, type, space_id) VALUES (?, ?, ?)").run('Roadmap Principal', 'roadmap', defaultSpaceId)
    defaultBoardId = result.lastInsertRowid
  } else {
    const board = await db.prepare('SELECT id FROM boards LIMIT 1').get() as { id: number }
    defaultBoardId = board.id
  }

  await db.prepare('UPDATE tasks SET board_id = ? WHERE board_id IS NULL').run(defaultBoardId)

  const defaultLists: [string, string][] = [
    ['Backlog', 'bg-slate-400'],
    ['En progreso', 'bg-amber-500'],
    ['En revisión', 'bg-violet-500'],
    ['Completado', 'bg-emerald-500'],
  ]

  const existingLists = await db.prepare('SELECT COUNT(*) AS count FROM board_lists WHERE board_id = ?').get(defaultBoardId) as { count: number }
  if (existingLists.count === 0) {
    for (const [name, color] of defaultLists) {
      await db.prepare('INSERT INTO board_lists (board_id, name, color) VALUES (?, ?, ?)').run(defaultBoardId, name, color)
    }
  }

  const taskCount = await db.prepare('SELECT COUNT(*) AS count FROM tasks').get() as { count: number }
  if (taskCount.count === 0) {
    const defaultTasks: [string, string, string, string, string, string, string][] = [
      ['Auditar flujo de onboarding', 'Revisar los puntos de fricción del nuevo flujo.', 'backlog', 'high', 'AM', '2026-08-24', '["Research"]'],
      ['Diseñar pantalla de analítica', 'Explorar métricas y jerarquía visual.', 'progress', 'medium', 'JS', '2026-08-28', '["Design"]'],
      ['Configurar eventos de producto', 'Conectar eventos clave.', 'review', 'low', 'LC', '2026-08-30', '["Dev"]'],
      ['Publicar actualización v2.4', 'Release notes y checklist.', 'done', 'medium', 'AM', '2026-08-18', '["Launch"]'],
    ]

    let position = 0
    for (const [title, description, status, priority, assignee, dueDate, labels] of defaultTasks) {
      await db.prepare(
        'INSERT INTO tasks (title, description, status, priority, assignee, due_date, labels, board_id, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(title, description, status, priority, assignee, dueDate, labels, defaultBoardId, position)
      position++
    }
  }

  const crmCount = await db.prepare('SELECT COUNT(*) AS count FROM crm_stages').get() as { count: number }
  if (crmCount.count === 0) {
    const crmStages: [string, string, number][] = [
      ['Contacto nuevo', 'bg-slate-400', 0],
      ['Presupuesto enviado', 'bg-amber-500', 1],
      ['En negociación', 'bg-violet-500', 2],
      ['Cerrado / Ganado', 'bg-emerald-500', 3],
    ]

    for (const [name, color, position] of crmStages) {
      await db.prepare('INSERT INTO crm_stages (name, color, position) VALUES (?, ?, ?)').run(name, color, position)
    }
  }

  const contactCount = await db.prepare('SELECT COUNT(*) AS count FROM contacts').get() as { count: number }
  if (contactCount.count === 0) {
    const stmt = await db.prepare('INSERT INTO contacts (name, email, phone, company, position, address, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    for (const [name, email, phone, company, position, address, website, notes] of contactData) {
      await stmt.run(name, email, phone, company, position, address, website, notes)
    }
  }
}
