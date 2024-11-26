import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAppointment } from '@/lib/actions/appointment.actions';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface SearchParamProps {
    params: { userId: string };
    searchParams: { appointmentId: string };
  }



const Success =async ({ params, searchParams }: SearchParamProps) => {

    const { userId } = await params;
    const appointmentId = await searchParams?.appointmentId || '';

    const appointment=await getAppointment(appointmentId)

    // console.log(appointment)



  return (
    <div className='flex h-screen max-h-screen px-[5%]'>
        <div className='success-img'>
            <Link href='/'>
            <Image
            src="/assets/icons/logo-full.png"
            height={1000}
            width={1000}
            alt="Patient"
            className="mb-0 h-20 w-fit"
          />
            </Link>
            <section className='flex flex-col items-center'>
                <Image
                src='/assets/gifs/success1.gif'
                height={300}
                width={280}
                alt='success'
                />
            <h2 className="header mb-6 max-w-[600px] text-center">
                Your <span className='text-blue-500'>appointment request</span> has been successfully received!
            </h2>
            <p>We will be in touch shortly to confirm.</p>
            </section>
            <section className='request-details'>
                <p>Requested appointment details.</p>
                <div className='flex items-center gap-3'>
                    <p className='whitespace-nowrap'>Dr. {appointment?.primaryPhysician}</p>
                    
                    <div className='flex gap-2'>
                        <Image
                        src="/assets/icons/calendar.svg"
                        height={24}
                        width={24}
                        alt='calender'
                        />
                        <p>{formatDateTime(appointment?.schedule).dateTime}</p>
                    </div>
                </div>
            </section>
            <Button variant="outline" className='shad-primary-btn' asChild>
                <Link href={`/patients/${userId}/new-appointment`}>
                New Appointment
                </Link>
            </Button>

            <p className="copyright">
              ©2024 HealthCare
            </p>

        </div>
    </div>
  )
}

export default Success
