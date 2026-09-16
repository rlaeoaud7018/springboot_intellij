package com.office.samplepjt;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HoneController {

    @GetMapping({"","/"})
    public String home() {
        System.out.println("[HomeController] home()");

        String nextPage = "home";   // home.html

        return nextPage;

    }

}
