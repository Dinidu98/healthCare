"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

import {StatusBadge} from "../StatusBadge"
import { formatDateTime } from "@/lib/utils"
import  AppointmentModal  from "../AppointmentModal";
import { Appointment } from "@/types/appwrite.types"


export const columns: ColumnDef<Appointment>[] = [
  {
    header:'ID',
    cell:({row})=><p className="text-14-medium">{row.index+1}</p>
  },
  {
    accessorKey:'patient',
    header:'Patient',
    cell:({row})=><p className="text-14-meduim">{row.original.patient.name}</p>
    
  },
  {
    accessorKey: "status",
    header: "Status",
    cell:({row})=>(
      <div className="min-w-[115px]">
        <StatusBadge status={row.original.status}/>
      </div>
    )
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell:({row})=>(
      <p className="text-14-regular min-w-[100px]">
        {formatDateTime(row.original.schedule).dateTime}
      </p>
    )
  },
  {
    accessorKey: "primaryPhysician",
    header: 'Doctor',
    cell: ({ row }) => <p>Dr. {row.original.primaryPhysician}</p>,
  },

  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row:{original:data} }) => {

      return (
        <div className="flex gap-1">
          <AppointmentModal
          type="schedule"
          patientId={data.patient.$id}
          userId={data.userId}
          appointment={data}
          title="Schedule Appointment"
          description="Please confirm following details"

          />
          <AppointmentModal
          type="cancel"
          patientId={data.patient.$id}
          userId={data.userId}
          appointment={data}
          title="Cancel Appointment"
          description="Confirm to cancel the appointment"
          />
        </div>
      );
    },
  },
]
