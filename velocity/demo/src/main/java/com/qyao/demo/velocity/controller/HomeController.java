package com.qyao.demo.velocity.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by q_yao on 2017/3/23.
 */
@Controller
@RequestMapping("/")
public class HomeController {

    public String index() {
        return "home/index";
    }

}
