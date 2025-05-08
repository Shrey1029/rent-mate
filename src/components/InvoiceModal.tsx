
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Printer } from 'lucide-react';

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  rentalPeriod: {
    start: string;
    end: string;
  };
  item: {
    id: string;
    name: string;
    price: number;
    priceUnit: string;
  };
  owner: {
    id: string;
    name: string;
    contact: string;
    location: string;
  };
  renter: {
    id: string;
    name: string;
    contact: string;
    location: string;
  };
  totalAmount: number;
  status: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
  if (!invoiceData) return null;

  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const printInvoice = () => {
    if (!invoiceRef.current) return;
    
    const printContents = invoiceRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Rental Invoice</DialogTitle>
          <DialogDescription>
            Rental invoice details for your records
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 mb-6 flex justify-end gap-2">
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={printInvoice} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm" ref={invoiceRef}>
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-center text-rentmate-orange">RENTMATE</h1>
            <h2 className="text-xl font-semibold text-center">RENTAL INVOICE</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Invoice #:</p>
              <p className="font-medium">{invoiceData.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date Issued:</p>
              <p className="font-medium">{invoiceData.issueDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Owner Information</h3>
              <p className="text-sm">{invoiceData.owner.name}</p>
              <p className="text-sm">Contact: {invoiceData.owner.contact}</p>
              <p className="text-sm">Location: {invoiceData.owner.location}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Renter Information</h3>
              <p className="text-sm">{invoiceData.renter.name}</p>
              <p className="text-sm">Contact: {invoiceData.renter.contact}</p>
              <p className="text-sm">Location: {invoiceData.renter.location}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Rental Details</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 mb-2">
                <p className="text-sm">Item:</p>
                <p className="text-sm font-medium">{invoiceData.item.name}</p>
              </div>
              <div className="grid grid-cols-2 mb-2">
                <p className="text-sm">Price:</p>
                <p className="text-sm">₹{invoiceData.item.price} {invoiceData.item.priceUnit}</p>
              </div>
              <div className="grid grid-cols-2 mb-2">
                <p className="text-sm">Rental Period:</p>
                <p className="text-sm">{invoiceData.rentalPeriod.start} to {invoiceData.rentalPeriod.end}</p>
              </div>
              <div className="grid grid-cols-2 mb-2">
                <p className="text-sm">Status:</p>
                <p className="text-sm capitalize font-medium">{invoiceData.status}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Total Amount:</h3>
              <p className="text-xl font-bold">₹{invoiceData.totalAmount}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for using RentMate! For any questions, please contact support.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
