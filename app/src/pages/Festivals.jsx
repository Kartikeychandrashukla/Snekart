import CategoryShop from './CategoryShop'
import Seo from '../components/Seo'

export default function Festivals() {
  return (
    <>
      <Seo
        title="Diwali, Rakhi & Festival Gift Hampers in Lucknow – Snekart"
        description="Festive gift hampers for Diwali, Rakhi, Holi and more, delivered across Lucknow."
      />
      <CategoryShop
        type="Festival"
        field="festival"
        title="Shop by Festival"
        subtitle="Kits made for the festivities."
      />
    </>
  )
}
