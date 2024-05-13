import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    @Autowired
    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    // Ügyfél létrehozása
    public Client createClient(Client client) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return clientRepository.save(client);
    }

    // Ügyfelek lekérdezése
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    // Ügyfél keresése azonosító alapján
    public Client getClientById(Long id) {
        return clientRepository.findById(id).orElse(null);
    }

    // Ügyfél frissítése
    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id).orElse(null);
        if (client != null) {
            // itt hajtsd végre a frissítési logikát
            return clientRepository.save(client);
        }
        return null;
    }

    // Ügyfél törlése
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
