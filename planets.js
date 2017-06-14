var planets = [{id : 'endor',
				name : 'Endor',
                nodes : ['geonosis', 'kashyyyk', 'hoth', 'bespin']
               },
               {id : 'hoth',
                name : 'Hoth',
                nodes : ['death-star', 'coruscant', 'endor']
               },
               {id : 'bespin',
                name : 'Bespin',
                nodes : ['death-star', 'endor', 'tatooine']
               },
               {id : 'geonosis',
                name : 'Geonosis',
                nodes : ['yavin-4', 'endor', 'coruscant']
               },
               {id : 'tatooine',
                name : 'Tatooine',
                nodes : ['kashyyyk', 'bespin']
               },
               {id : 'kashyyyk',
                name : 'Kashyyyk',
                nodes : ['yavin-4', 'tatooine', 'endor']
               },
               {id : 'yavin-4',
                name : 'Yavin IV',
                nodes : ['geonosis', 'kashyyyk']
               },
               {id : 'death-star',
                name : 'The Death Star',
                nodes : ['hoth', 'bespin']
               },
               {id : 'coruscant',
                name : 'Coruscant',
                nodes : ['hoth', 'geonosis']
               }];
               
module.exports = planets;