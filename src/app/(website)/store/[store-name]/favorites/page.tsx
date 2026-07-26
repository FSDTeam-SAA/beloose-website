
import Testimonial from "../_components/testimonial";
import FavoriteHero from "./_components/favorite-hero";
import FavoriteProduct from "./_components/favorite-product";

const FavoritePage = () => {
  return (
    <main className="min-h-screen bg-[#1B0F06]">
      <FavoriteHero />
      <FavoriteProduct/>
      <Testimonial/>
    </main>
  );
};

export default FavoritePage;
