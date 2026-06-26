import jsPDF from 'jspdf'

const C = {
  blue:      [26,  86, 219],
  darkBlue:  [14,  46, 120],
  dark:      [17,  24,  39],
  gray:      [107,114, 128],
  lightGray: [243,244, 246],
  midGray:   [209,213, 219],
  white:     [255,255, 255],
  green:     [5,  150,  68],
  orange:    [217,119,   6]
}

function header(doc, title, subtitle, date, num) {
  doc.setFillColor(...C.blue)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setFillColor(...C.darkBlue)
  doc.rect(0, 24, 210, 6, 'F')

  doc.setTextColor(...C.white)
  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  doc.text('MediCitas', 14, 11)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Atencion Medica', 14, 17)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 196, 11, { align:'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(subtitle, 196, 17, { align:'right' })

  doc.setTextColor(...C.white)
  doc.setFontSize(7.5)
  doc.text(`Fecha: ${date}   |   N. ${num}`, 14, 28)
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(...C.lightGray)
  doc.rect(14, y, 182, 8, 'F')
  doc.setDrawColor(...C.midGray)
  doc.setLineWidth(0.3)
  doc.line(14, y, 14, y + 8)
  doc.setFillColor(...C.blue)
  doc.rect(14, y, 3, 8, 'F')
  doc.setTextColor(...C.blue)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text(text.toUpperCase(), 20, y + 5.5)
  return y + 13
}

function row(doc, label, value, x, y, maxW) {
  doc.setTextColor(...C.gray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(label, x, y)
  doc.setTextColor(...C.dark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const lines = doc.splitTextToSize(String(value || '—'), maxW || 80)
  doc.text(lines, x + 38, y)
  return y + lines.length * 5
}

function footer(doc, pageNum, total, doctorName, medicalReg) {
  const y = 278
  doc.setDrawColor(...C.midGray)
  doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
  doc.setTextColor(...C.gray)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Documento generado por MediCitas. Valido con firma del medico tratante.', 14, y + 4)
  doc.text(`Medico: ${doctorName}  |  RM: ${medicalReg || '—'}`, 14, y + 8)
  doc.text(`Pagina ${pageNum} de ${total}`, 196, y + 4, { align:'right' })
}

function signatureBlock(doc, doctorName, medicalReg, specialty, signatureDataUrl, y) {
  const blockY = Math.max(y + 10, 220)

  doc.setDrawColor(...C.midGray)
  doc.setLineWidth(0.3)
  doc.rect(110, blockY, 86, 48, 'S')

  doc.setFillColor(...C.lightGray)
  doc.rect(110, blockY, 86, 7, 'F')
  doc.setTextColor(...C.blue)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('FIRMA DEL MEDICO TRATANTE', 153, blockY + 5, { align:'center' })

  if (signatureDataUrl) {
    try {
      doc.addImage(signatureDataUrl, 'PNG', 114, blockY + 9, 78, 26)
    } catch (err) {
      doc.setTextColor(...C.gray)
      doc.setFontSize(8)
      doc.text('[Firma no disponible]', 153, blockY + 22, { align:'center' })
    }
  } else {
    doc.setTextColor(...C.gray)
    doc.setFontSize(8)
    doc.text('[Firma pendiente]', 153, blockY + 22, { align:'center' })
  }

  doc.setDrawColor(...C.dark)
  doc.setLineWidth(0.4)
  doc.line(114, blockY + 38, 192, blockY + 38)

  doc.setTextColor(...C.dark)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(doctorName, 153, blockY + 42, { align:'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.gray)
  doc.text(`${specialty || 'Medico tratante'}  |  RM: ${medicalReg || '—'}`, 153, blockY + 46, { align:'center' })
}

export async function generateMedicalRecordPDF(record, signatureDataUrl, doctorProfile) {
  const doc = new jsPDF({ unit:'mm', format:'a4' })

  const date = new Date(record.createdAt).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })
  const doctorName = record.doctorName ?? `${doctorProfile?.name ?? ''} ${doctorProfile?.lastName ?? ''}`.trim()
  const medicalReg = doctorProfile?.medicalReg ?? record.medicalReg ?? '—'
  const specialty  = doctorProfile?.specialty  ?? record.specialty  ?? ''

  header(doc, 'HISTORIA CLINICA', 'Registro medico oficial', date, `HC-${record.id}`)

  let y = 38

  y = sectionTitle(doc, 'Informacion del paciente', y)
  y = row(doc, 'Paciente:', record.patientName, 14, y, 130) + 1
  y = row(doc, 'Cedula:', record.patientDocumentId ?? '—', 14, y, 130) + 1
  y += 2

  y = sectionTitle(doc, 'Medico tratante', y)
  y = row(doc, 'Nombre:', doctorName, 14, y, 130) + 1
  y = row(doc, 'Especialidad:', specialty, 14, y, 130) + 1
  y = row(doc, 'Reg. medico:', medicalReg, 14, y, 130) + 1
  y += 4

  y = sectionTitle(doc, 'Diagnostico', y)
  doc.setTextColor(...C.dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const diagLines = doc.splitTextToSize(record.diagnosis, 182)
  doc.text(diagLines, 14, y)
  y += diagLines.length * 5 + 4

  if (record.notes) {
    y = sectionTitle(doc, 'Notas clinicas', y)
    doc.setTextColor(...C.dark)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    const noteLines = doc.splitTextToSize(record.notes, 182)
    doc.text(noteLines, 14, y)
    y += noteLines.length * 5 + 4
  }

  if (record.prescriptions?.length > 0) {
    y = sectionTitle(doc, 'Formula medica', y)

    record.prescriptions.forEach((p, i) => {
      if (y > 235) {
        doc.addPage()
        header(doc, 'HISTORIA CLINICA', 'Formula medica (cont.)', date, `HC-${record.id}`)
        y = 38
      }

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(...C.midGray)
      doc.setLineWidth(0.3)
      doc.roundedRect(14, y, 182, 28, 2, 2, 'FD')

      doc.setFillColor(...C.blue)
      doc.roundedRect(14, y, 8, 28, 2, 2, 'F')
      doc.rect(18, y, 4, 28, 'F')

      doc.setTextColor(...C.white)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(String(i + 1), 18, y + 16, { align:'center' })

      doc.setTextColor(...C.blue)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(p.medication, 26, y + 7)

      doc.setTextColor(...C.dark)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Dosis: ${p.dose}`, 26, y + 13)
      doc.text(`Frecuencia: ${p.frequency}`, 90, y + 13)
      doc.text(`Duracion: ${p.duration || 'Indefinida'}`, 150, y + 13)

      if (p.instructions) {
        doc.setTextColor(...C.gray)
        doc.setFontSize(7.5)
        const lines = doc.splitTextToSize(`Indicaciones: ${p.instructions}`, 162)
        doc.text(lines, 26, y + 19)
      }

      y += 32
    })
  }

  signatureBlock(doc, doctorName, medicalReg, specialty, signatureDataUrl, y)

  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    footer(doc, i, total, doctorName, medicalReg)
  }

  doc.save(`historia_clinica_${record.id}_${(record.patientName ?? 'paciente').replace(/\s/g, '_')}.pdf`)
}

export async function generateDisabilityPDF(disability, signatureDataUrl, doctorProfile) {
  const doc = new jsPDF({ unit:'mm', format:'a4' })

  const startDate = new Date(disability.startDate + 'T00:00:00').toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })
  const endDate   = new Date(disability.endDate   + 'T00:00:00').toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })
  const today     = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })
  const doctorName = disability.doctorName ?? `${doctorProfile?.name ?? ''} ${doctorProfile?.lastName ?? ''}`.trim()
  const medicalReg = doctorProfile?.medicalReg ?? '—'
  const specialty  = doctorProfile?.specialty  ?? ''

  header(doc, 'CERTIFICADO DE INCAPACIDAD', 'Documento medico oficial', today, `INC-${disability.id}`)

  let y = 38

  y = sectionTitle(doc, 'Datos del paciente', y)
  y = row(doc, 'Paciente:', disability.patientName ?? '—', 14, y, 130) + 1
  y = row(doc, 'Cedula:', disability.patientDocumentId ?? '—', 14, y, 130) + 1
  y += 4

  y = sectionTitle(doc, 'Medico que expide', y)
  y = row(doc, 'Nombre:', doctorName, 14, y, 130) + 1
  y = row(doc, 'Especialidad:', specialty, 14, y, 130) + 1
  y = row(doc, 'Reg. medico:', medicalReg, 14, y, 130) + 1
  y += 4

  y = sectionTitle(doc, 'Periodo de incapacidad', y)

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(...C.midGray)
  doc.roundedRect(14, y, 55, 22, 2, 2, 'FD')
  doc.roundedRect(78, y, 55, 22, 2, 2, 'FD')
  doc.roundedRect(142, y, 54, 22, 2, 2, 'FD')

  doc.setTextColor(...C.gray)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('FECHA DE INICIO', 41, y + 6, { align:'center' })
  doc.text('FECHA DE FIN',    105, y + 6, { align:'center' })
  doc.text('DIAS DE REPOSO',  169, y + 6, { align:'center' })

  const days = Math.ceil((new Date(disability.endDate) - new Date(disability.startDate)) / 86400000) + 1

  doc.setTextColor(...C.dark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(startDate, 41, y + 16, { align:'center' })
  doc.text(endDate,   105, y + 16, { align:'center' })
  doc.setTextColor(...C.blue)
  doc.text(`${days} dias`, 169, y + 16, { align:'center' })

  y += 28

  y = sectionTitle(doc, 'Motivo de la incapacidad', y)
  doc.setTextColor(...C.dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const reasonLines = doc.splitTextToSize(disability.reason, 182)
  doc.text(reasonLines, 14, y)
  y += reasonLines.length * 5 + 4

  if (disability.notes) {
    y = sectionTitle(doc, 'Observaciones', y)
    const noteLines = doc.splitTextToSize(disability.notes, 182)
    doc.text(noteLines, 14, y)
    y += noteLines.length * 5
  }

  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(217, 119, 6)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, y + 6, 182, 12, 2, 2, 'FD')
  doc.setTextColor(146, 64, 14)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Este certificado es valido unicamente con la firma del medico tratante y el sello institucional.', 105, y + 14, { align:'center' })
  y += 20

  signatureBlock(doc, doctorName, medicalReg, specialty, signatureDataUrl, y)

  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    footer(doc, i, total, doctorName, medicalReg)
  }

  doc.save(`incapacidad_${disability.id}_${(disability.patientName ?? 'paciente').replace(/\s/g, '_')}.pdf`)
}
