import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';

// import { AuthenticationForm } from "@/components/Auth/AuthenticationForm";

export default function HomePage() {
  return (
    <>
      {/* <AuthenticationForm /> */}
      <Welcome />
      <ColorSchemeToggle />
    </>
  );
}
