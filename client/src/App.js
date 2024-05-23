// routes
import Router from "./routes";
// theme
import ThemeProvider from './theme';
// components
import ThemeSettings from './components/settings';

function App() {
  return (
    <ThemeProvider>
      
        {" "}
        <Router />{" "}
      
    </ThemeProvider>
  );
}

export default App;
