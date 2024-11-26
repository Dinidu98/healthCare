'use server'

import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases, ENDPOINT, messaging } from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";



export const createAppointment = async (appointment: CreateAppointmentParams) => {
  console.log("from action: ", appointment)
  try {
    console.log("Attempting to create document with:", appointment);
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    )
    console.log("Newly created appointment", newAppointment)
    return newAppointment



  } catch (error: any) {
    console.error("Error Creating appointment:", error.message, error);
    throw error;
  }
};


export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
    )
    return appointment;

  } catch (error: any) {
    console.error("Error getting appointment Details:", error.message, error);
  }

}


export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]//newest one at top
    )

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0
    }

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents
    }
    return data
  } catch (error: any) {
    console.error("Error getting appointment Details:", error.message, error);
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: [],
    };
  }
}

export const updateAppointment = async ({
  userId,
  appointmentId,
  appointment,
  type
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    )

    if (!updatedAppointment) {
      throw new Error("Appointment not found")
    }
    // const smsMessage = `
    // Hi, It's HealthCare
    // ${type === 'schedule'
    //     ? `Your Appointment has been scheduled for ${formatDateTime(appointment.schedule!.dateTime)} with Dr.${appointment.primaryPhysicion}` : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}`

    //   }
    // `
    // console.log("dfghjk")
    // await sendSMSNotification(userId,smsMessage)

    revalidatePath('/admin')
    return updatedAppointment;
  } catch (error: any) {
    console.error("Error getting updating appointment Details:", error.message, error);
  }
}

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    console.log("Message sent successfully:", message);
    return message;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error; // Or return an appropriate fallback
  }
  
}