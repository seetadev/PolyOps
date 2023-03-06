import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function NavBar() {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">📦 Data Guilds</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        {/* <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/guilds-list">Explore Guilds</Nav.Link>
            <Nav.Link href="/guilds-info">Guild-Info</Nav.Link>
            <Nav.Link href="/guilds-nft-list">Guild-NFT-List</Nav.Link>
            <Nav.Link href="/guilds-upload">Guild-Upload</Nav.Link>
            <Nav.Link href="/guilds-create">Guild-Create</Nav.Link>
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
          </Nav>
        </Navbar.Collapse> */}
      </Container>
    </Navbar>
  );
}

export default NavBar;