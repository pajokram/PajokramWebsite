import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ProjectsMasonryComponent} from '../../projects-masonry/projects-masonry.component';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProjectsMasonryComponent,
  ]
})
export class MainViewComponent {
  items: {
    img: string,
    originalWidth: number,
    originalHeight: number,
    title: string,
    link?: string,
    subtitle?: string,
    isPost?: boolean
  }[] = [
    {
      img: "images/projects/2026_stickermania.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Stickermania",
      subtitle: "2026",
      link: "https://github.com/pajokram/stickermania"
    },
    {
      img: "images/projects/2025_04_grannies_gotcha.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Granny's Gotcha",
      subtitle: "April 2025",
      link: "https://pajokram.itch.io/grannys-gotcha"
    },
    {
      img: "images/projects/2023_04_heart_warming_deliveries.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Heart Warming Deliveries",
      subtitle: "April 2023",
      link: "https://pajokram.itch.io/heart-warming-deliveries"
    },
    {
      img: "images/projects/2022_12_hedge_hurl.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Hedge Hurl",
      subtitle: "December 2022",
      link: "https://pajokram.itch.io/hedge-hurl"
    },
    {
      img: "images/projects/2022_11_bernds_biscuits.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Bernd's Biscuits",
      subtitle: "November 2022",
      link: "https://pajokram.itch.io/bernds-biscuits"
    },
    {
      img: "images/projects/2022_08_schick.png",
      originalWidth: 800,
      originalHeight: 1165,
      title: "Schick #15",
      subtitle: "August 2022",
      link: "pdf/schick_15_schmitz.pdf"
    },
    {
      img: "images/projects/2022_06_dicity.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Dicity",
      subtitle: "June 2022",
      link: "https://pajokram.itch.io/dicity"
    },
    {
      img: "images/projects/2022_04_dating_under_the_comet.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Dating Under the Comet",
      subtitle: "April 2022",
      link: "https://pajokram.itch.io/dating-under-the-comet"
    },
    {
      img: "images/projects/2021_11_advent_calender.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Adventskalender 2021",
      subtitle: "November 2022",
    },
    {
      img: "images/projects/2021_08_schick.png",
      originalWidth: 800,
      originalHeight: 1116,
      title: "Schick #14",
      subtitle: "August 2021",
      link: "pdf/schick_14_schmitz.pdf"
    },
    {
      img: "images/projects/2021_james_bot.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "James Bot",
      subtitle: "2021"
    },
    {
      img: "images/projects/2020_01_master_thesis.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Master Thesis on Probabilistic Number Theory",
      subtitle: "January 2020",
      link: "pdf/master_thesis_schmitz.pdf"
    },
    {
      img: "images/projects/2020_01_ramen_god.png",
      originalWidth: 800,
      originalHeight: 1142,
      title: "Ramen God Illustration",
      subtitle: "January 2020",
      link: "posts/ramen-god",
    },
    {
      img: "images/projects/2018_08_bachelor_thesis.png",
      originalWidth: 800,
      originalHeight: 800,
      title: "Bachelor Thesis on Point Processes",
      subtitle: "August 2018",
      link: "pdf/bachelor_thesis_schmitz.pdf"
    },
    {
      img: "images/projects/2015_07_schick.png",
      originalWidth: 800,
      originalHeight: 979,
      title: "Schick #8",
      subtitle: "July 2015",
      link: "pdf/schick_8_schmitz.pdf"
    },
  ]
}
