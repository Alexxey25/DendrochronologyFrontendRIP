export const ROUTES = { //пути для навигации в приложении
  CONSTRUCTIONS: '/constructions',
  CONSTRUCTION: '/construction/:id',
  DENDROCHRONOLOGY: '/dendrochronology/:id',
  DENDROCHRONOLOGIES: '/dendrochronologies',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
} as const
// для каждого ключа из ROUTES создаем свой лейбл
export const ROUTE_LABELS: { [key in keyof typeof ROUTES]: string } = {
  CONSTRUCTIONS: 'Конструкции',
  CONSTRUCTION: 'Конструкция',
  DENDROCHRONOLOGY: 'Заявка',
  DENDROCHRONOLOGIES: 'Заявки',
  SIGN_IN: 'Вход',
  SIGN_UP: 'Регистрация',
}
