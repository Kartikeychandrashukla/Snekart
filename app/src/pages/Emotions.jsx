import CategoryShop from './CategoryShop'
import Seo from '../components/Seo'

export default function Emotions() {
  return (
    <>
      <Seo
        title="Thank You, Sorry & Love Gift Hampers in Lucknow – Snekart"
        description="Say thank you, sorry or I love you with curated gift hampers delivered across Lucknow."
      />
      <CategoryShop
        type="Emotion"
        field="emotion"
        title="Shop by Emotion"
        subtitle="Tell us how you feel. We'll find the right kit."
      />
    </>
  )
}
