package com.wholesale.orderapp.controller;

import com.wholesale.orderapp.entity.Shop;
import com.wholesale.orderapp.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "*")
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    @GetMapping
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }
    
    @GetMapping("/city/{cityId}")
    public List<Shop> getShopsByCity(@PathVariable Long cityId) {
        return shopRepository.findByCityId(cityId);
    }

    @PostMapping
    public Shop createShop(@RequestBody Shop shop) {
        return shopRepository.save(shop);
    }
    
    @DeleteMapping("/{id}")
    public void deleteShop(@PathVariable Long id) {
        shopRepository.deleteById(id);
    }
}
