"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useEffect, useState } from "react";
import {  getAppointmentSchema } from "@/lib/validation";
import { createUser } from "@/lib/actions/patient.actions";
import router from "next/router";
import { FormFieldType } from "./PatientForm";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { useRouter } from "next/navigation";
import { Appointment } from "@/types/appwrite.types";


const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel" |"schedule";
  appointment?:Appointment,
  setOpen:(open:boolean)=>void
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const router=useRouter()


  const AppointmentFormValidation= getAppointmentSchema(type)
  useEffect(() => {
    setInitialDate(new Date());
  }, []);

  // console.log(appointment);
  

  // 1. Define your form.
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
        primaryPhysician:appointment ? appointment.primaryPhysician : '',
        // schedule:appointment ? new Date(appointment.schedule):new Date(Date.now()),
        schedule: appointment ? new Date(appointment.schedule) : initialDate || new Date(),
        reason: appointment ? appointment.reason : "",
        note:appointment?.note ||"",
        cancellationReason:appointment?.cancellationReason ||"",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {

    // console.log("SBtn Click",type);
    
    setIsLoading(true);
    // console.log("Loading Started")
    // console.log("userId from appointment form ", userId)
    // console.log("patientId from appointment form ",patientId,)

    let status;
    switch(type){
        case 'schedule':
            status='scheduled'
        break;

        case 'cancel':
            status='cancelled'
        break;

        default:
            status='pending'
            break;
    }

    // console.log("type",type);
    

    try {
      if(type==='create'&& patientId){
        const appointmentData={
            userID: userId,
            patient:patientId,
            primaryPhysician:values.primaryPhysician,
            schedule:new Date(values.schedule),
            reason:values.reason!,
            note:values.note,
            status:status as Status,
            
        } 
        
      const appointment=await createAppointment(appointmentData)
      // console.log("appointment creating",appointmentData )
      
      if(appointment && appointment.$id){
        // console.log("appointment id", appointment.$id)
        form.reset();
        // router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
        router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
      }else{
        console.log("Failed to get ID or Failed response:",appointment)
      }
    }else{
      // console.log('updating appointment');
      
      const appointmentToUpdate={
        userId,
        appointmentId:appointment?.$id!,
        appointment:{
          primaryPhysician:values?.primaryPhysician,
          schedule:new Date(values?.schedule),
          status:status as Status,
          cancellationReason: values?.cancellationReason,
        },
        type
      }
      const updatedAppointment=await updateAppointment(appointmentToUpdate)
      if(updatedAppointment){
        setOpen && setOpen(false);
       form.reset()
      }
    }


    } catch (error) {
      console.log(error);
    }finally{
      // setIsLoading(false)
      // console.log("Loading End")
    }
  }


  let buttonLabel;

  switch (type) {
    case 'cancel':
        buttonLabel="Cancel Appointment"
        
        break;
    case 'create':
        buttonLabel="Create Appointment"
        break;

    case 'schedule':
        buttonLabel="Schedule Appointment"
  
    default:
        break;
  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        
        {type === 'create' && 
        <section className="mb-12 space-y-4">
        <h1 className="header">Create Your New Appointment</h1>
      </section>
        }
        
        

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Enter a Doctor's Name"
            />

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected Date and Time"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />
            <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="reason"
            label="Reason for this appointment"
            placeholder="Enter reason for this appointment"
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="note"
            label="Notes"
            placeholder="Enter Notes"
          />

            </div>
          </>
        )}

        {type ==="cancel" && (
            <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Please add a reason to cancel the appointment"
          />
        )}

        <SubmitButton isLoading={isLoading} className={`${type==="cancel" ? "shad-danger-btn":"shad-primary-btn"} w-full`}>
            {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
