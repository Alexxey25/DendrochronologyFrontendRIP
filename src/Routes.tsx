export const ROUTES = {
  CONSTRUCTIONS: '/constructions',
  CONSTRUCTION: '/construction/:id',
}

export const ROUTE_LABELS: { [key in keyof typeof ROUTES]: string } = {
  CONSTRUCTIONS: 'Конструкции',
  CONSTRUCTION: 'Конструкция',
}
