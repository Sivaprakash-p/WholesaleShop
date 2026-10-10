package com.wholesale.orderapp.repository;

import com.wholesale.orderapp.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
    List<Shop> findByCityId(Long cityId);
}
