import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir a cualquier usuario que entre a la raíz directamente al Login
  redirect('/login');
}