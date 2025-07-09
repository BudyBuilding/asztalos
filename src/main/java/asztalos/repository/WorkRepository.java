package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import asztalos.model.Client;
import asztalos.model.User;
import asztalos.model.Work;

public interface WorkRepository extends JpaRepository<Work, Long> {

    @Query("SELECT COALESCE(SUM(w.clientPaid), 0) FROM Work w WHERE w.user.userId = :userId")
    Double sumClientPaidByUserId(@Param("userId") Long userId);

    @Query("""
       SELECT COALESCE(SUM(w.companyPrice), 0)
       FROM Work w 
       WHERE w.user.userId = :userId
         AND w.isOrdered = true
         AND w.companyStatus <> 'Completed'
    """)
    Double sumPendingCompanyPriceByUser(@Param("userId") Long userId);

    @Query("""
       SELECT COALESCE(SUM(w.userPaid), 0)
       FROM Work w 
       WHERE w.user.userId = :userId
         AND w.isOrdered = true
         AND w.companyStatus <> 'Completed'
    """)
    Double sumPendingUserPaidByUser(@Param("userId") Long userId);


    @Query("SELECT COALESCE(SUM(w.clientPaid), 0) FROM Work w WHERE w.client.clientId = :clientId")
    Double sumClientPaidByClientId(@Param("clientId") Long clientId);

    @Query("SELECT COALESCE(SUM(w.clientPrice), 0) FROM Work w WHERE w.client.clientId = :clientId")
    Double sumClientPriceByClientId(@Param("clientId") Long clientId);


    List<Work> findByUser(User user);
    List<Work> findByClient(Client client);
}
