import React from 'react'
import StoreUserHero from './_components/store-user-hero'
import TrustedBy from '../../_components/trusted-by'
import HowHumidorWorks from './_components/how-humidor-works'
import Testimonial from './_components/testimonial'
import AgeVerification from './_components/age-verification'
import NewArrivals from './_components/new-arrivals'
import StaffPicks from './_components/staff-picks'
import SurpriseMe from './_components/surprise-me'
import DailyFeatured from './_components/daily-featured'
// import PerfectPairings from './_components/perfect-pairings'
import GuidedDiscovery from './_components/guided-discovery'

const UserStorePage = ({
  params,
}: {
  params: { "store-name": string };
}) => {
  const storeName = params["store-name"];

  console.log(storeName);
  return (
    <AgeVerification>

        <StoreUserHero/>
        <TrustedBy/>

        <DailyFeatured/>
        <NewArrivals/>

        <GuidedDiscovery/>

        <StaffPicks/>
        <SurpriseMe/>


        <Testimonial/>
        <HowHumidorWorks/>
        {/* <PerfectPairings/> */}
    </AgeVerification>
  )
}

export default UserStorePage
