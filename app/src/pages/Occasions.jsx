import CategoryShop from './CategoryShop'
import Seo from '../components/Seo'

export default function Occasions() {
  return (
    <>
      <Seo
        title="Birthday & Anniversary Gift Hampers in Lucknow – Snekart"
        description="Shop birthday, anniversary and wedding gift hampers with fast delivery across Lucknow."
      />
      <CategoryShop
        type="Occasion"
        field="occasion"
        title="Shop by Occasion"
        subtitle="The right gift for the moment."
      />
    </>
  )
}
