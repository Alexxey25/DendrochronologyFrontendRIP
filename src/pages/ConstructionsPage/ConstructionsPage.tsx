import { useState } from 'react'
import Header from '../../components/Header/Header'
import ConstructionsList from '../../components/ConstructionsList/ConstructionsList'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTE_LABELS } from '../../Routes'
import { CONSTRUCTIONS_MOCK } from '../../modules/mock'
import cartIcon from '../../assets/cart_icon.png'
import './ConstructionsPage.css'

export default function ConstructionsPage() {
  const [searchValue, setSearchValue] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')

  // const [searchQuery, setSearchQuery] = useState('')
  // const filteredConstructions = useMemo(() => {
  //   return CONSTRUCTIONS_MOCK.filter((c) => {
  //     if (c.is_delete) return false
  //     if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
  //     return true
  //   })
  // }, [searchQuery])

  const handleSearch = () => {
    setAppliedQuery(searchValue.trim())
  }

  const filteredConstructions = CONSTRUCTIONS_MOCK.filter((c) => {
    if (c.is_delete) return false
    if (appliedQuery && !c.title.toLowerCase().includes(appliedQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="mainpage">
      <Header
        searchQuery={searchValue}
        onQueryChange={setSearchValue}
        onSearch={handleSearch}
      />
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.CONSTRUCTIONS }]} />

      {filteredConstructions.length > 0 ? (
        <ConstructionsList constructions={filteredConstructions} />
      ) : (
        <p className="no-results">По запросу «{appliedQuery}» конструкции не найдены</p>
      )}

      <div className="cart-badge cart-inactive">
        <img src={cartIcon} className="cart-icon" alt="корзина" />
        <span className="cart-count">0</span>
      </div>
    </div>
  )
}
