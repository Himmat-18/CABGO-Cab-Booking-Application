package com.example.demo.repository;

import com.example.demo.entity.Ride;
import com.example.demo.entity.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.demo.entity.RideStatus;

import java.util.Collection;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {

    boolean existsByDriverIdAndStatusIn(
            Long driverId,
            Collection<RideStatus> statuses
    );
    boolean existsByDriverIdAndStatusInAndIdNot(
            Long driverId,
            List<RideStatus> statuses,
            Long rideId
    );

    // Get all rides belonging to a particular customer
    List<Ride> findByCustomerId(Long customerId);
    List<Ride> findByDriverId(Long driverId);
}