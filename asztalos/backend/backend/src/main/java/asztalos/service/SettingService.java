package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Setting;
import asztalos.repository.SettingRepository;

@Service
public class SettingService {

    @Autowired
    private SettingRepository settingRepository;

    public List<Setting> findAll() {
        return settingRepository.findAll();
    }

    public Optional<Setting> findById(Long id) {
        return settingRepository.findById(id);
    }

    public Optional<Setting> findByName(String name) {
        return settingRepository.findByName(name);
    }

    public Setting save(Setting setting) {
        return settingRepository.save(setting);
    }

    public void deleteById(Long id) {
        settingRepository.deleteById(id);
    }

}
