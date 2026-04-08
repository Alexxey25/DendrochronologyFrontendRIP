export const ROUTES = { //пути для навигации в приложении
  CONSTRUCTIONS: '/constructions',
  CONSTRUCTION: '/construction/:id',
}
// для каждого ключа из ROUTES создаем свой лейбл
export const ROUTE_LABELS: { [key in keyof typeof ROUTES]: string } = {
  CONSTRUCTIONS: 'Конструкции',
  CONSTRUCTION: 'Конструкция',
}
