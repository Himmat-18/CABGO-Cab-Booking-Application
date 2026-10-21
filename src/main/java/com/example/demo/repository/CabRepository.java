package com.example.demo.repository;

import com.example.demo.entity.Cab;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CabRepository extends JpaRepository<Cab, Long> {
}