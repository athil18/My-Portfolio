import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Home navigation link', () => {
  render(<App />);
  const homeLink = screen.getAllByText(/Home/i)[0];
  expect(homeLink).toBeInTheDocument();
});
