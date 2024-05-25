package asztalos.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.CreatedItem;
import asztalos.service.CreatedItemService;

@RestController
@RequestMapping("/created-items")
public class CreatedItemController {

    @Autowired
    private CreatedItemService createdItemService;

    @PostMapping
    public CreatedItem createCreatedItem(@RequestBody CreatedItem createdItem) {
        return createdItemService.saveCreatedItem(createdItem);
    }

    @GetMapping("/{id}")
    public CreatedItem getCreatedItemById(@PathVariable Long id) {
        return createdItemService.getCreatedItemById(id);
    }

    @GetMapping
    public List<CreatedItem> getAllCreatedItems() {
        return createdItemService.getAllCreatedItems();
    }

    @DeleteMapping("/{id}")
    public void deleteCreatedItem(@PathVariable Long id) {
        createdItemService.deleteCreatedItem(id);
    }
}
