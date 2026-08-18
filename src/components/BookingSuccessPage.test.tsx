import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookingSuccessPage from './BookingSuccessPage';
import '@testing-library/jest-dom';
import { User } from '../types';

// Mock the dependencies
const mockNavigate = jest.fn();
const mockLocationState = {
  booking: { bookingId: 'BK-123', date: '2026-05-01', time: '10:00 AM' },
  invoice: {
    invoiceNumber: 'INV-456',
    invoiceType: 'FULL',
    date: '2026-05-01',
    time: '10:00',
    bookingId: 'BK-123',
    customer: { name: 'Test User', email: 'test@user.com', phone: '123', address: '123 Test' },
    service: { name: 'Test Service', date: '2026-05-01', time: '10:00', items: [{ name: 'Test Service', price: 100 }] },
    pricing: { subtotal: 100, total: 100, paidAmount: 0, balanceAmount: 100 },
    paymentMethod: 'cod',
    status: 'PAID',
  },
  paymentMethod: 'cod',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: mockLocationState,
  }),
}));

const mockUser: User = { id: 'user-1', name: 'Test User', email: 'test@user.com', role: 'customer', verified: true };

describe('BookingSuccessPage', () => {
  beforeEach(() => {
    // Clear mock history before each test
    mockNavigate.mockClear();
  });

  test('renders booking confirmation and summary correctly', () => {
    render(
      <BrowserRouter>
        <BookingSuccessPage user={mockUser} />
      </BrowserRouter>
    );

    // Check for confirmation message
    expect(screen.getByText(/Booking Confirmed!/i)).toBeInTheDocument();
    // Check for COD payment message
    expect(screen.getByText(/Please pay cash to the service professional/i)).toBeInTheDocument();
    // Check for booking details
    expect(screen.getByText(/BK-123/i)).toBeInTheDocument();
    expect(screen.getByText(/INV-456/i)).toBeInTheDocument();
  });

  test('shows the invoice when "View Invoice" button is clicked', () => {
    render(
      <BrowserRouter>
        <BookingSuccessPage user={mockUser} />
      </BrowserRouter>
    );

    // Find and click the "View Invoice" button
    const viewInvoiceButton = screen.getByRole('button', { name: /View Invoice/i });
    fireEvent.click(viewInvoiceButton);

    // After clicking, the invoice should be visible
    // We can check for an element that is unique to the InvoiceGenerator
    expect(screen.getAllByText(/CLOUD LAUNDRY.LK/i).length).toBeGreaterThan(0);
    // And the "Back to Confirmation" button should now be visible
    expect(screen.getByRole('button', { name: /Back to Confirmation/i })).toBeInTheDocument();
  });

  test('shows loading message and redirects when no data is available', () => {
    // Override the mock for this specific test
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ state: null });
    
    // Mock setTimeout to control the timer
    jest.useFakeTimers();

    render(
      <BrowserRouter>
        <BookingSuccessPage user={mockUser} />
      </BrowserRouter>
    );

    // Check for loading message
    expect(screen.getByText(/Loading booking information.../i)).toBeInTheDocument();

    // Fast-forward time to trigger the redirect
    jest.runAllTimers();

    // Check if navigate was called to redirect the user (updated landing path)
    expect(mockNavigate).toHaveBeenCalledWith('/admin/financials', { replace: true });

    // Clean up timers
    jest.useRealTimers();
  });
});