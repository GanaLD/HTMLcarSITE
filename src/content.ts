export type SystemId = 'battery' | 'drive' | 'optics'
export const systems = {
  battery: {
    index: '01', label: 'Bateria', category: 'Armazenamento de energia', title: 'A energia\nsob seus pés.',
    short: 'Explore o conjunto da bateria',
    description: 'Uma bateria de tração armazena energia elétrica e a fornece ao sistema de propulsão. Neste conceito, ela fica posicionada na parte inferior, sob a cabine.',
    benefit: 'Um conjunto baixo e plano libera mais espaço para a cabine acima dele.',
    image: '/media/battery-blue.png', anchor: { x: 64, y: 72 },
    points: [
      { label: 'Módulos de células', text: 'As células agrupadas em módulos armazenam a energia.', x: 31, y: 42 },
      { label: 'Conexão de alta tensão', text: 'As conexões laranja indicam o percurso elétrico de alta tensão nesta ilustração.', x: 27, y: 55 },
      { label: 'Estrutura de proteção', text: 'O invólucro da bateria sustenta e protege o conjunto.', x: 49, y: 49 },
    ],
  },
  drive: {
    index: '02', label: 'Propulsão elétrica', category: 'Entrega de potência', title: 'Eletricidade,\nem movimento.',
    short: 'Explore a unidade de propulsão',
    description: 'O motor elétrico transforma energia elétrica em rotação. Uma engrenagem redutora transfere essa rotação para as rodas.',
    benefit: 'O controle do torque do motor proporciona ao motorista uma resposta direta nas rodas.',
    image: '/media/drive-blue.png', anchor: { x: 25, y: 48 },
    points: [
      { label: 'Enrolamentos do estator', text: 'Os enrolamentos estacionários criam um campo magnético rotativo.', x: 32, y: 46 },
      { label: 'Rotor', text: 'O rotor gira dentro do estator e movimenta o eixo.', x: 24, y: 49 },
      { label: 'Engrenagem redutora', text: 'A redução diminui a velocidade de rotação e aumenta o torque nas rodas.', x: 48, y: 51 },
    ],
  },
  optics: {
    index: '03', label: 'Lentes avançadas', category: 'Luz e óptica', title: 'Luz,\nmoldada com precisão.',
    short: 'Explore a óptica do farol',
    description: 'Dentro deste farol conceitual, um módulo de LED produz a luz e uma lente de projeção a molda em um feixe controlado.',
    benefit: 'A distribuição precisa da luz ajuda a iluminar a via exatamente onde é necessário.',
    image: '/media/lenses-blue.png', anchor: { x: 36, y: 60 },
    points: [
      { label: 'Lente de projeção', text: 'A lente óptica direciona a luz para o padrão de feixe projetado.', x: 32.9, y: 55.7 },
      { label: 'Módulo de LED', text: 'A fonte de luz fica posicionada atrás do conjunto óptico de projeção.', x: 50.3, y: 57.2 },
      { label: 'Dissipador de calor', text: 'Aletas metálicas dissipam o calor do conjunto da fonte de luz.', x: 61.9, y: 56.3 },
    ],
  },
} as const
export const systemIds: SystemId[] = ['battery', 'drive', 'optics']
export type HotspotId = SystemId | 'wheels' | 'paint'
export const hotspots: { id: HotspotId; index: string; label: string; anchor: { x: number; y: number }; target: SystemId | null }[] = [
  ...(['battery', 'drive'] as const).map(id => ({ id, index: systems[id].index, label: systems[id].label, anchor: systems[id].anchor, target: id })),
  { id: 'paint', index: '03', label: 'Cor da carroceria', anchor: { x: 55, y: 51 }, target: null },
  { id: 'wheels', index: '04', label: 'Design das rodas', anchor: { x: 48, y: 71 }, target: null },
]

// Enable each pair only after first/last frames, crop and color have been checked.
export const clips: Record<SystemId, { forward: string; reverse: string; enabled: boolean }> = {
  battery: { forward: '/media/battery-forward.mp4', reverse: '/media/battery-reverse.mp4', enabled: false },
  drive: { forward: '/media/drive-forward.mp4', reverse: '/media/drive-reverse.mp4', enabled: false },
  optics: { forward: '/media/optics-forward.mp4', reverse: '/media/optics-reverse.mp4', enabled: false },
}
