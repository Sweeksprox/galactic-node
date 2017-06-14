var exports = module.exports = {};

exports.locations = {'endor' : [],
                'death-star' : [{id : 'boogins',
                            faction : 'imperials'}],
                'yavin-4' : [{id : 'sqweeks',
                        faction : 'rebels'},
                        {id : 'bednar',
                        faction : 'rebels'}],
                'hoth' : [],
                'bespin' : [],
                'kashyyyk' : [],
                'coruscant' : [],
                'tatooine' : [],
                'geonosis' : []
}

exports.users = {'sqweeks' : {id : 'sqweeks',
                            password : 'pwnt0909',
                            location : 'yavin-4',
                            faction : 'rebels',
                            contact : false,
                            moved : false,
                            token : null
                            }
    }
                
exports.bednar = {id : 'Bednar',
                location : 'yaviniv',
                faction : 'Rebel'}

exports.boogins = {id : 'Boogins',
                location : 'deathstar',
                faction : 'Rebels'}

exports.factions = {'rebels' : [{id : 'sqweeks', location : 'yavin-4'},
                              {id : 'bednar', location : 'yavin-4'}],
                    'imperials' : [{id : 'boogins', location : 'death-star'}]
}
                