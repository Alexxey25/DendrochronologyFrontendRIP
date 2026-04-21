import type { Construction } from './constructionsApi'

// import stockadeImg from '../assets/constructions/stockade.png'
// import stockadeVideo from '../assets/constructions/stockade.mp4'

// import supportingPilesImg from '../assets/constructions/supportingPiles.png'
// import supportingPilesVideo from '../assets/constructions/supportingPiles.mp4'

// import woodenRoofImg from '../assets/constructions/woodenRoof.png'
// import woodenRoofVideo from '../assets/constructions/woodenRoof.mp4'

// import logCabinImg from '../assets/constructions/logCabin.png'
// import logCabinVideo from '../assets/constructions/logCabin.mp4'

// import woodenLadderImg from '../assets/constructions/woodenLadder.png'
// import woodenLadderVideo from '../assets/constructions/woodenLadder.mp4'

// import woodenDoorImg from '../assets/constructions/woodenDoor.png'
// import woodenDoorVideo from '../assets/constructions/woodenDoor.mp4'

// import frontageImg from '../assets/constructions/frontage.jpg'
// import frontageVideo from '../assets/constructions/frontage.mp4'

// import pitImg from '../assets/constructions/pit.jpg'
// import pitVideo from '../assets/constructions/pit.mp4'

export const CONSTRUCTIONS_MOCK: Construction[] = [
  {
    id: 1,
    title: 'Частокол',
    use_life: '20 лет',
    description:
      'Ограждающая конструкция из вертикально вкопанных заострённых брёвен, традиционно использовавшаяся для защиты поселений. Отличается простотой возведения и высокой механической прочностью. Типовой use-life: 20 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 2,
    title: 'Опорные сваи',
    use_life: '40 лет',
    description:
      'Деревянные опорные элементы, забиваемые в грунт для передачи нагрузки от здания на более плотные слои почвы. Применяются в фундаментах на слабых грунтах и в условиях высокого уровня грунтовых вод. Типовой use-life: 40 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 3,
    title: 'Деревянная кровля',
    use_life: '35 лет',
    description:
      'Традиционное кровельное покрытие из дранки или гонта, широко применявшееся в жилых и хозяйственных постройках. Отличается хорошей теплоизоляцией и устойчивостью к перепадам температуры, но требует правильной укладки и вентиляции. Типовой use-life: 35 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 4,
    title: 'Сруб из бревна',
    use_life: '60 лет',
    description:
      'Несущая конструкция стен, собранная из горизонтально уложенных брёвен с угловыми врубками. Обеспечивает отличную теплоизоляцию и долговечность при правильной обработке древесины. Типовой use-life: 60 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 5,
    title: 'Деревянная лестница',
    use_life: '35 лет',
    description:
      'Внутренняя или наружная конструкция для перемещения между этажами, изготовленная из массива дерева. Сочетает функциональность и эстетику, требует защитного покрытия для долговечности. Типовой use-life: 35 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 6,
    title: 'Деревянная дверь',
    use_life: '50 лет',
    description:
      'Дверные полотна из массива древесины или клеёного бруса, применяемые как входные и межкомнатные. Обладают высокой звуко- и теплоизоляцией, экологичностью и долгим сроком службы. Типовой use-life: 50 лет',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 7,
    title: 'Палисадник',
    use_life: '10 лет',
    description:
      'Легкое ограждение палисадника из бруса и досок. Опорные столбы заглубляются в грунт и обрабатываются антисептиком для защиты от гниения. Пролеты заполняются штакетником, доской или решеткой.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 8,
    title: 'Деревянный сруб колодца',
    use_life: '30 лет',
    description:
      'Срубная обшивка шахты колодца из дубовых или сосновых брёвен. Защищает стенки от осыпания и обеспечивает чистоту воды. Дендрохронологический анализ сруба позволяет датировать время строительства водозаборного сооружения.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
]
