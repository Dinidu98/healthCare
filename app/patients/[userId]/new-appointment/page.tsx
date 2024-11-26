import React from 'react'
import Image from 'next/image'
import AppointmentForm from '@/components/forms/AppointmentForm'
import { getPatient } from '@/lib/actions/patient.actions'


interface SearchParamProps{
  params:{
    userId:string;
  }
}

const NewAppointment =async ({params}:SearchParamProps) => {


  const {userId}=await params
    // console.log("from NewAppointment Page.tsx:", userId)


    const patient=await getPatient(userId)
    // console.log("patient details from NewAppointment Page.tsx:", patient.$id)



  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
        <Image
            src="/assets/icons/logo-full.png"
            height={1000}
            width={1000}
            alt="Patient"
            className="mb-0 h-20 w-fit"
          />
          <AppointmentForm  type="create" userId={userId} patientId={patient.$id}/>


            <p className="copyright mt-10 py-12">
              ©2024 HealthCare
            </p>
        </div>
      </section>
      {/* <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px] bg-bottom" 
      /> */}
    </div>
  )
}

export default NewAppointment
