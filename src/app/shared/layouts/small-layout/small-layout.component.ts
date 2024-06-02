import {AfterViewInit, Component} from '@angular/core';
import {RouterModule} from "@angular/router";
import {DesignService} from "../../classes/design";

@Component({
  selector: 'app-small-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './small-layout.component.html',
  styleUrl: './small-layout.component.css'
})
export class SmallLayoutComponent implements AfterViewInit {

  ngAfterViewInit() {
    DesignService.themeViewer(document.body);
  }
}
