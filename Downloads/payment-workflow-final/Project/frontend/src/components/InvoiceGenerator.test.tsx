import { render, screen } from '@testing-library/react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import '@testing-library/jest-dom';

// 1. Arrange: Create mock data that looks like the real thing.
const mockInvoice: InvoiceData = {
  invoiceNumber: 'INV-TEST-001',
  invoiceType: 'FULL',
  date: '2026-04-21',
  time: '10:00 AM',
  bookingId: 'BK-TEST-001',
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '123-456-7890',
    address: '123 Test St, Test City',
  },
  service: {
    name: 'Test Service',
    date: '2026-04-22',
    time: '11:00 AM',
    items: [{ name: 'Test Service', price: 100 }],
  },
  pricing: {
    subtotal: 100,
    total: 100,
    paidAmount: 100,
    balanceAmount: 0,
  },
  paymentMethod: 'Credit Card',
  status: 'PAID',
};

test('renders invoice with basic information', () => {
  // 2. Act: Render the component into a virtual DOM.
  render(<InvoiceGenerator invoice={mockInvoice} />);

  // 3. Assert: Check if the rendered output is correct.
  // We use `screen.getByText` to find elements on the page.
  // The `/.../i` makes the search case-insensitive.
  expect(screen.getByText(/INV-TEST-001/i)).toBeInTheDocument();
  expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
  expect(screen.getByText(/Test Service/i)).toBeInTheDocument();
  expect(screen.getByText(/Credit Card/i)).toBeInTheDocument();
});

test('shows placeholder when service details are missing', () => {
  // Arrange: Create an invoice without the 'service' property.
  const incompleteInvoice = {
    ...mockInvoice,
    service: undefined as any, // Intentionally set to undefined
  };

  // Act
  render(<InvoiceGenerator invoice={incompleteInvoice} />);

  // Assert: Component should still render without crashing and should not show the original service name
  const { container } = render(<InvoiceGenerator invoice={incompleteInvoice} />);
  expect(container.textContent).toMatch(/INV-TEST-001/i);
  expect(container.textContent).not.toMatch(/Test Service/i);
});