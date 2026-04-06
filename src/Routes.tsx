export const ROUTES = {
  HOME: '/',
  CONSTRUCTIONS: '/constructions',
  CONSTRUCTION: '/construction/:id',
}

export const ROUTE_LABELS: { [key in keyof typeof ROUTES]: string } = {
  HOME: 'Главная',
  CONSTRUCTIONS: 'Конструкции',
  CONSTRUCTION: 'Конструкция',
}
