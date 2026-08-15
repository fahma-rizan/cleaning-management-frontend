import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentPage from './PaymentPage';

const mockNavigate = jest.fn();
const mockFetch = jest.fn();
const mockAddNotification = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
  useParams: () => ({ bookingId: 'BK-123' }),
}));

jest.mock('../utils/notificationUtils', () => ({
  addNotification: (...args: any[]) => mockAddNotification(...args),
}));

jest.mock('../utils/auth', () => ({
  tokenStorage: {
    getTokens: () => ({ accessToken: 'demo-token' }),
  },
}));

describe('PaymentPage offline payment confirmation', () => {
  const booking = {
    bookingId: 'BK-123',
    price: 2500,
    serviceType: 'Home Cleaning',
    date: '2026-08-18',
    time: '10:00 AM',
    address: '123 Main St',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => booking,
    });
    global.fetch = mockFetch as any;
  });

  test.each(['cod', 'pay-after-completion'])('redirects %s to the booking success page after confirm', async (method) => {
    render(<PaymentPage user={{
      id: 'user-1',
      name: 'Test User',
      email: 'user@example.com',
      phone: '+94 700000000',
      role: 'customer',
      verified: true,
    }} />);

    await waitFor(() => expect(screen.getByText(/Complete Your Booking/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(method === 'cod' ? /Cash on Delivery/i : /Online Payment After Completion/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirm Booking/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Booking/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/booking-success', expect.objectContaining({
        state: expect.objectContaining({
          paymentMethod: method,
        }),
      }));
    }, { timeout: 5000 });
  });
});
