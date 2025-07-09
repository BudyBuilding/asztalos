package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import asztalos.model.User;
import asztalos.model.Client;
import asztalos.model.Work;
import asztalos.repository.WorkRepository;
import asztalos.repository.UserRepository;
import asztalos.repository.ClientRepository;                      

@Service
public class WorkService {

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRepository clientRepository;

    public List<Work> findAll() {
        return workRepository.findAll();
    }

    public Optional<Work> findById(Long id) {
        return workRepository.findById(id);
    }

    public List<Work> findByUser(User user) {
        return workRepository.findByUser(user);
    }
    
    public List<Work> findByClient(Client client) {
    return workRepository.findByClient(client);
    }



    @Autowired private WorkRepository workRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ClientRepository clientRepo;             

    @Transactional
    public Work save(Work work) {
        System.out.println(">>> WorkService.save() called for workId=" + work.getWorkId()
                           + " clientPaid=" + work.getClientPaid());
        Work w = workRepo.save(work);

        // recompute sold
        Long userId = w.getUser().getUserId();
        System.out.println("    -> recomputing sold for userId=" + userId);
        Double sum = workRepo.sumClientPaidByUserId(userId);
        System.out.println("    -> sumClientPaidByUserId = " + sum);
        User u = userRepo.findById(userId).orElseThrow();
        u.setSold(sum != null ? sum : 0d);
        userRepo.save(u);
        System.out.println("    -> user.sold updated to " + u.getSold());
        recalcUserSold(w.getUser().getUserId());
        recalcClientSold(w.getClient().getClientId());
        return w;
    }

    @Transactional
    public Work update(Work work) {
        System.out.println(">>> WorkService.update() called for workId=" + work.getWorkId()
                           + " companyPrice=" + work.getCompanyPrice()
                           + " userPaid=" + work.getUserPaid());
        Work w = workRepo.save(work);
        recalcUserSold(w.getUser().getUserId());
        recalcClientSold(w.getClient().getClientId());
        return w;
    }

    @Transactional
    public void deleteById(Long id) {
        System.out.println(">>> WorkService.deleteById() called for id=" + id);
        workRepo.findById(id).ifPresent(w -> {
            Long uid = w.getUser().getUserId();
            workRepo.deleteById(id);
            recalcUserSold(uid);
            recalcClientSold(w.getClient().getClientId());
        });
    }

    private void recalcUserSold(Long userId) {
        System.out.println("    -> recalcUserSold for userId=" + userId);
        Double pending = workRepo.sumPendingCompanyPriceByUser(userId);
        Double paid    = workRepo.sumPendingUserPaidByUser(userId);
        System.out.println("       sumPendingCompanyPrice=" + pending
                           + ", sumPendingUserPaid=" + paid);
        Double sum = (pending != null ? pending : 0d)
                   - (paid    != null ? paid    : 0d);
        User u = userRepo.findById(userId)
                         .orElseThrow(() -> new RuntimeException("User not found"));
        u.setSold(sum);
        userRepo.save(u);
        System.out.println("    -> user.sold updated to " + u.getSold());
    }

    @Transactional
    public void recalcClientSold(Long clientId) {
        Double sum = workRepo.sumClientPriceByClientId(clientId)                       
                     - workRepo.sumClientPaidByClientId(clientId); 
        Client c = clientRepo.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
        c.setClientSold(sum != null ? sum : 0d);
        clientRepo.save(c);
        System.out.println("    -> client.clientSold updated to " + c.getClientSold());
    }


}

