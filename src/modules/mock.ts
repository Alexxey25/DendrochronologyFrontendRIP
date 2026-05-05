import type { Construction } from './constructionsApi'

export const CONSTRUCTIONS_MOCK: Construction[] = [
  {
    id: 1,
    title: 'Частокол',
    use_life: '20 лет',
    description:
      'Ограждающая конструкция из вертикально вкопанных заострённых брёвен, традиционно использовавшаяся для защиты поселений. Отличается простотой возведения и высокой механической прочностью.',
    short_description_en: 'Wooden stockade wall of sharpened logs for defense and perimeter security.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 2,
    title: 'Опорные сваи',
    use_life: '40 лет',
    description:
      'Деревянные опорные элементы, забиваемые в грунт для передачи нагрузки от здания на более плотные слои почвы. Применяются в фундаментах на слабых грунтах и в условиях высокого уровня грунтовых вод.',
    short_description_en: 'Driven timber piles supporting structures on weak or waterlogged ground.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 3,
    title: 'Деревянная кровля',
    use_life: '35 лет',
    description:
      'Традиционное кровельное покрытие из дранки или гонта, широко применявшееся в жилых и хозяйственных постройках. Отличается хорошей теплоизоляцией и устойчивостью к перепадам температуры, но требует правильной укладки и вентиляции.',
    short_description_en:
      'Wooden shingle roof covering with layered boards and ventilated weather protection.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 4,
    title: 'Сруб из бревна',
    use_life: '60 лет',
    description:
      'Несущая конструкция стен, собранная из горизонтально уложенных брёвен с угловыми врубками. Обеспечивает отличную теплоизоляцию и долговечность при правильной обработке древесины.',
    short_description_en: 'Interlocked log cabin frame with load-bearing walls and durable timber joints.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 5,
    title: 'Деревянная лестница',
    use_life: '35 лет',
    description:
      'Внутренняя или наружная конструкция для перемещения между этажами, изготовленная из массива дерева. Сочетает функциональность и эстетику, требует защитного покрытия для долговечности.',
    short_description_en: 'Solid wood staircase with stable steps and a durable protective finish.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  {
    id: 6,
    title: 'Деревянная дверь',
    use_life: '50 лет',
    description:
      'Дверные полотна из массива древесины или клеёного бруса, применяемые как входные и межкомнатные. Обладают высокой звуко- и теплоизоляцией, экологичностью и долгим сроком службы.',
    short_description_en: 'Massive wooden door panel for insulated entryways and interior access.',
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
    short_description_en: 'Light wooden garden fence with treated posts and decorative slat sections.',
    image_url: '',
    video_url: '',
    is_delete: false,
  },
  // {
  //   id: 8,
  //   title: 'Деревянный сруб колодца',
  //   use_life: '30 лет',
  //   description:
  //     'Срубная обшивка шахты колодца из дубовых или сосновых брёвен. Защищает стенки от осыпания и обеспечивает чистоту воды. Дендрохронологический анализ сруба позволяет датировать время строительства водозаборного сооружения.',
  //   short_description_en: 'Timber well lining that stabilizes the shaft and keeps water access clean.',
  //   image_url: '',
  //   video_url: '',
  //   is_delete: false,
  // },
]
